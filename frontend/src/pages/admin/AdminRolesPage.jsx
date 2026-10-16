import {
  AlertCircle,
  CheckCircle,
  Edit2,
  Lock,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import api from '../../services/api.js';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/roles');
      if (res.data.success) {
        setRoles(res.data.data.roles || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal memuat role.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingRole(r);
    setName(r.name);
    setDescription(r.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      if (editingRole) {
        await api.patch(`/admin/roles/${editingRole.id}`, {
          name: editingRole.name === 'ADMIN' ? undefined : name.toUpperCase().trim(),
          description: description.trim(),
        });
        setFeedback({ type: 'success', text: 'Role berhasil diperbarui.' });
      } else {
        await api.post('/admin/roles', {
          name: name.toUpperCase().trim(),
          description: description.trim(),
        });
        setFeedback({ type: 'success', text: 'Role baru berhasil dibuat.' });
      }
      setModalOpen(false);
      fetchRoles();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan role.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (r.name === 'ADMIN') {
      alert('Role ADMIN adalah role sistem dan tidak boleh dihapus.');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus role "${r.name}"?`)) return;
    try {
      const res = await api.delete(`/admin/roles/${r.id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', text: `Role "${r.name}" berhasil dihapus.` });
        fetchRoles();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal menghapus role.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manajemen Role & Hak Akses</h1>
          <p className="text-sm text-slate-400 mt-1">
            Role mengendalikan video apa saja yang dapat ditonton oleh setiap pengguna terdaftar.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Role Baru</span>
        </button>
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

      {loading ? (
        <LoadingSpinner text="Memuat role sistem..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.id}
              className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between ${
                r.name === 'ADMIN'
                  ? 'border-brand-500/40 bg-brand-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase ${
                      r.name === 'ADMIN'
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {r.name}
                  </span>

                  {r.name === 'ADMIN' ? (
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Sistem
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Edit Role"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Hapus Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {r.description || 'Tidak ada deskripsi.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{r._count?.users || 0} Pengguna Terdaftar</span>
                <span>{r._count?.videoRoles || 0} Video Terkait</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nama Role *
                </label>
                <input
                  type="text"
                  required
                  disabled={editingRole?.name === 'ADMIN'}
                  placeholder="Contoh: AI_ENGINEER"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 uppercase disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Gunakan huruf kapital dan underscore tanpa spasi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Deskripsi Hak Akses
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan singkat konten video apa yang diizinkan untuk role ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
