import {
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentStatus) params.status = currentStatus;
      if (currentSearch) params.search = currentSearch;

      const [usersRes, rolesRes] = await Promise.all([
        api.get('/admin/users', { params }),
        api.get('/admin/roles'),
      ]);

      if (usersRes.data.success) {
        setUsers(usersRes.data.data.users || []);
      }
      if (rolesRes.data.success) {
        setRoles(rolesRes.data.data.roles || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal memuat data pengguna.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, [currentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsersAndRoles();
  };

  const handleStatusFilter = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('status', val);
    else next.delete('status');
    setSearchParams(next);
  };

  const handleRoleChange = async (userId, newRoleId) => {
    setUpdatingId(userId);
    setFeedback(null);
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, {
        roleId: newRoleId || null,
      });
      if (res.data.success) {
        setFeedback({ type: 'success', text: 'Role pengguna berhasil diperbarui.' });
        fetchUsersAndRoles();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah role.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    setFeedback(null);
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        setFeedback({ type: 'success', text: res.data.message });
        fetchUsersAndRoles();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah status akun.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Manajemen Pengguna & Persetujuan Akun</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tinjau permohonan akun baru, tetapkan role akses, atau tangguhkan akun jika diperlukan.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau email pengguna..."
              value={searchParams.get('search') || ''}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('search', e.target.value);
                else next.delete('search');
                setSearchParams(next);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status Akun:</span>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending (Menunggu)</option>
            <option value="ACTIVE">Active (Aktif)</option>
            <option value="SUSPENDED">Suspended (Ditangguhkan)</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <LoadingSpinner text="Memuat daftar pengguna..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pengguna"
          description="Tidak ditemukan pengguna yang sesuai dengan filter."
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Pengguna</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4">Role Akses</th>
                  <th className="py-3.5 px-4">Terdaftar Sejak</th>
                  <th className="py-3.5 px-4 text-right">Tindakan Persetujuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isUpdating = updatingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-400 font-bold">
                                ANDA
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : u.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {u.status === 'ACTIVE' && <CheckCircle className="w-3 h-3" />}
                          {u.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {u.status === 'SUSPENDED' && <UserX className="w-3 h-3" />}
                          {u.status}
                        </span>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          disabled={isSelf || isUpdating}
                          value={u.roleId || ''}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                        >
                          <option value="">-- Belum ada role --</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status Action Buttons */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {isSelf ? (
                          <span className="text-xs text-slate-400 italic">Akun aktif sendiri</span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            {u.status === 'PENDING' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                              >
                                Setujui & Aktifkan
                              </button>
                            )}

                            {u.status === 'ACTIVE' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold disabled:opacity-50"
                              >
                                Tangguhkan
                              </button>
                            )}

                            {u.status === 'SUSPENDED' && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                              >
                                Aktifkan Kembali
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
