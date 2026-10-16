import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Play,
  Save,
  Shield,
  Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import api from '../../services/api.js';

function extractIdFromUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/')[1];
      return id && id.length === 11 ? id : null;
    }
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v');
      return id && id.length === 11 ? id : null;
    }
    if (parsed.pathname.startsWith('/shorts/')) {
      const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
      return id && id.length === 11 ? id : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function AdminVideoFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    description: '',
    categoryId: '',
    status: 'DRAFT',
    allowedRoleIds: [],
  });

  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [detectedVideoId, setDetectedVideoId] = useState(null);

  // Load categories and roles
  useEffect(() => {
    async function loadFormData() {
      setLoading(true);
      try {
        const [catRes, roleRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/roles'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.data.categories || []);
        }
        if (roleRes.data.success) {
          const availableRoles = roleRes.data.data.roles || [];
          setRoles(availableRoles);

          // If new video, default select all non-admin roles or first role
          if (!isEditing && availableRoles.length > 0) {
            setFormData((prev) => ({
              ...prev,
              allowedRoleIds: availableRoles.map((r) => r.id),
            }));
          }
        }

        // If editing, load existing video
        if (isEditing) {
          const vidRes = await api.get(`/admin/videos/${id}`);
          if (vidRes.data.success) {
            const v = vidRes.data.data.video;
            setFormData({
              title: v.title,
              youtubeUrl: v.youtubeUrl,
              description: v.description,
              categoryId: v.categoryId,
              status: v.status,
              allowedRoleIds: v.allowedRoles ? v.allowedRoles.map((ar) => ar.roleId) : [],
            });
            setDetectedVideoId(v.youtubeId);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data formulir.');
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, [id, isEditing]);

  const handleUrlChange = (url) => {
    setFormData((prev) => ({ ...prev, youtubeUrl: url }));
    const detected = extractIdFromUrl(url);
    setDetectedVideoId(detected);
  };

  const handleRoleToggle = (roleId) => {
    setFormData((prev) => {
      const current = prev.allowedRoleIds;
      if (current.includes(roleId)) {
        return { ...prev, allowedRoleIds: current.filter((r) => r !== roleId) };
      } else {
        return { ...prev, allowedRoleIds: [...current, roleId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.categoryId) {
      setError('Silakan pilih kategori.');
      return;
    }

    if (formData.allowedRoleIds.length === 0) {
      setError('Pilih minimal satu role yang diizinkan untuk mengakses video ini.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.patch(`/admin/videos/${id}`, formData);
      } else {
        await api.post('/admin/videos', formData);
      }
      navigate('/admin/videos');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan video.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Menyiapkan form video..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/videos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Video</span>
        </Link>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <h1 className="text-2xl font-extrabold text-white mb-2">
          {isEditing ? 'Edit Video Tutorial' : 'Tambah Video Tutorial Baru'}
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Masukkan tautan YouTube, kategori, dan tentukan role mana saja yang berhak menonton video ini.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Video */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Judul Video *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Belajar JavaScript Dasar dari Nol"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* YouTube URL & Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                URL Video YouTube *
              </label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
              />
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Format didukung: <code>youtube.com/watch?v=...</code>, <code>youtu.be/...</code>, atau <code>youtube.com/shorts/...</code>
              </p>
            </div>

            {/* Live Thumbnail Preview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Preview Thumbnail
              </label>
              {detectedVideoId ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                  <img
                    src={`https://img.youtube.com/vi/${detectedVideoId}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-brand-300 font-mono">
                    ID: {detectedVideoId}
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-slate-900 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                  <Video className="w-6 h-6 mb-1 text-slate-400" />
                  <span>Masukkan URL YouTube yang valid untuk melihat preview thumbnail</span>
                </div>
              )}
            </div>
          </div>

          {/* Kategori & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Kategori atau Subkategori *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parent ? `— ${cat.parent.name} / ${cat.name}` : cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Status Publikasi *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="DRAFT">DRAFT (Hanya admin yang dapat melihat)</option>
                <option value="PUBLISHED">PUBLISHED (Tampil untuk role yang diizinkan)</option>
              </select>
            </div>
          </div>

          {/* Role Access Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>Role yang Diizinkan Mengakses Video Ini *</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Pilih satu atau lebih role. Pengguna dengan role yang dicentang akan dapat menonton video ini.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((r) => {
                const checked = formData.allowedRoleIds.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-brand-500/10 border-brand-500/40 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleRoleToggle(r.id)}
                      className="mt-0.5 rounded border-slate-700 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{r.name}</p>
                      {r.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">{r.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Deskripsi Video *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Jelaskan ringkasan materi, catatan penting, atau panduan singkat..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              to="/admin/videos"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-semibold transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-brand-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : isEditing ? 'Perbarui Video' : 'Simpan Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
