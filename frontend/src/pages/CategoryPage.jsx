import { ArrowLeft, ChevronRight, Folder, FolderTree } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import Footer from '../components/Footer.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Navbar from '../components/Navbar.jsx';
import VideoCard from '../components/VideoCard.jsx';
import api from '../services/api.js';

export default function CategoryPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  useEffect(() => {
    async function fetchCategoryVideos() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/categories/${slug}`);
        if (res.data.success) {
          setData(res.data.data);
          setActiveSubcategory(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat kategori.');
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryVideos();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <LoadingSpinner fullScreen text="Memuat kategori materi..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
          <EmptyState
            title="Kategori Tidak Ditemukan"
            description={error || 'Kategori yang Anda tuju tidak tersedia.'}
            actionText="Kembali ke Dashboard"
            actionLink="/dashboard"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const { category, videos } = data;
  const filteredVideos = activeSubcategory
    ? videos.filter((v) => v.categoryId === activeSubcategory)
    : videos;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {category.parent && (
            <>
              <Link to={`/categories/${category.parent.slug}`} className="hover:text-white transition-colors">
                {category.parent.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </>
          )}
          <span className="text-brand-400 font-semibold">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-extrabold text-white">{category.name}</h1>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl">
            Kumpulan video tutorial YouTube terpilih dalam topik {category.name}.
          </p>

          {/* Subcategories Tabs */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveSubcategory(null)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubcategory === null
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Semua Subkategori ({videos.length})
              </button>

              {category.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategory(sub.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeSubcategory === sub.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <EmptyState
            title="Belum Ada Video"
            description="Tidak ada video tutorial yang tersedia untuk subkategori atau role akun Anda."
            actionText="Lihat Semua Video"
            actionLink="/dashboard"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
