import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FolderTree,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import api from '../../services/api.js';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data statistik.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickApprove = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
      if (res.data.success) {
        setActionSuccess('Akun berhasil disetujui!');
        setTimeout(() => setActionSuccess(null), 3000);
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui akun');
    }
  };

  if (loading) return <LoadingSpinner text="Memuat statistik admin..." />;
  if (error) return <EmptyState title="Gagal Memuat" description={error} />;

  const { counts, recentPendingUsers, recentVideos } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ringkasan Dashboard Admin
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pantau ringkasan tutorial, pengguna, kategori, dan permohonan akses baru.
          </p>
        </div>

        <Link
          to="/admin/videos/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Video Baru</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Video */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Video
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{counts.videos.total}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-medium">{counts.videos.published} Diterbitkan</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-amber-400 font-medium">{counts.videos.draft} Draft</span>
          </div>
        </div>

        {/* Akun Pending */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Menunggu Persetujuan
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-400 mb-2">{counts.users.pending}</div>
          <div className="text-xs text-slate-400">
            {counts.users.pending > 0 ? 'Perlu tindakan aktivasi' : 'Semua akun telah diproses'}
          </div>
        </div>

        {/* Pengguna Aktif */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pengguna Aktif
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{counts.users.active}</div>
          <div className="text-xs text-slate-400">
            Dari total {counts.users.total} akun terdaftar
          </div>
        </div>

        {/* Kategori & Role */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Kategori & Role
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{counts.categories}</div>
          <div className="text-xs text-slate-400">
            Kategori aktif &bull; {counts.roles} Role hak akses
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Pending Users & Recently Added Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Users Requiring Attention */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Permohonan Akun Baru</h2>
            </div>
            <Link
              to="/admin/users?status=PENDING"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              Lihat Semua
            </Link>
          </div>

          {recentPendingUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 my-auto">
              Tidak ada permohonan akun baru yang menunggu persetujuan.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 -mx-6 px-6">
              {recentPendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-200 truncate">{pendingUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">{pendingUser.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleQuickApprove(pendingUser.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Aktifkan
                    </button>
                    <Link
                      to={`/admin/users`}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      Atur Role
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Added Videos */}
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">Video Terakhir Ditambahkan</h2>
            </div>
            <Link to="/admin/videos" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              Lihat Semua
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 my-auto">
              Belum ada video yang ditambahkan ke platform.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 -mx-6 px-6">
              {recentVideos.map((vid) => (
                <div key={vid.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-12 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-200 truncate">{vid.title}</p>
                      <span className="text-[11px] text-slate-400">
                        {vid.category?.name || 'Uncategorized'} &bull;{' '}
                        <span className={vid.status === 'PUBLISHED' ? 'text-emerald-400' : 'text-amber-400'}>
                          {vid.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/videos/${vid.id}/edit`}
                    className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg shrink-0 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
