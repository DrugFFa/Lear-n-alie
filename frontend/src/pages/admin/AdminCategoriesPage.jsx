import {
  AlertCircle,
  CheckCircle,
  CornerDownRight,
  Edit2,
  Folder,
  FolderPlus,
  FolderTree,
  Plus,
  Trash2,
  Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import api from '../../services/api.js';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.data.categories || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal memuat kategori.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = (defaultParentId = '') => {
    setEditingCategory(null);
    setName('');
    setParentId(defaultParentId);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setParentId(cat.parentId || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      if (editingCategory) {
        await api.patch(`/admin/categories/${editingCategory.id}`, {
          name,
          parentId: parentId || null,
        });
        setFeedback({ type: 'success', text: 'Kategori berhasil diperbarui.' });
      } else {
        await api.post('/admin/categories', {
          name,
          parentId: parentId || null,
        });
        setFeedback({ type: 'success', text: 'Kategori baru berhasil ditambahkan.' });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan kategori.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;
    try {
      const res = await api.delete(`/admin/categories/${id}`);
      if (res.data.success) {
        setFeedback({ type: 'success', text: `Kategori "${name}" berhasil dihapus.` });
        fetchCategories();
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Gagal menghapus kategori.' });
    }
  };

  const topLevelCategories = categories.filter((c) => !c.parentId);
  const getSubcategories = (parentCatId) => categories.filter((c) => c.parentId === parentCatId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manajemen Kategori & Subkategori</h1>
          <p className="text-sm text-slate-400 mt-1">
            Atur hierarki kategori dan subkategori tutorial agar materi tertata rapi.
          </p>
        </div>

        <button
          onClick={() => openAddModal('')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/25"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Tambah Kategori Induk</span>
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
        <LoadingSpinner text="Memuat struktur kategori..." />
      ) : topLevelCategories.length === 0 ? (
        <EmptyState
          title="Belum Ada Kategori"
          description="Tambahkan kategori pertama untuk mulai mengelompokkan video tutorial."
          actionText="Tambah Kategori Induk"
          onAction={() => openAddModal('')}
        />
      ) : (
        <div className="space-y-4">
          {topLevelCategories.map((parent) => {
            const subs = getSubcategories(parent.id);
            return (
              <div key={parent.id} className="glass-panel rounded-2xl border border-slate-800 p-5">
                {/* Parent Category Row */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{parent.name}</span>
                        <span className="text-xs font-mono text-slate-400 font-normal">
                          (/{parent.slug})
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {parent._count?.videos || 0} video langsung &bull; {subs.length} subkategori
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddModal(parent.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Tambah Subkategori"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Subkategori</span>
                    </button>
                    <button
                      onClick={() => openEditModal(parent)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id, parent.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories List */}
                {subs.length > 0 && (
                  <div className="pt-3 pl-4 space-y-2">
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-sm font-semibold text-slate-200">{sub.name}</span>
                          <span className="text-xs font-mono text-slate-400">({sub.slug})</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                            {sub._count?.videos || 0} video
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Edit Subkategori"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id, sub.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                            title="Hapus Subkategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mobile Development"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Kategori Induk (Opsional)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Tanpa Induk (Kategori Utama) --</option>
                  {topLevelCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pilih kategori induk jika kategori ini merupakan subkategori.
                </p>
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
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
