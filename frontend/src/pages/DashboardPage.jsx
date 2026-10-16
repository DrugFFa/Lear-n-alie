import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Filter,
  PlaySquare,
  Search,
  Shield,
  Sparkles,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import Footer from '../components/Footer.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Navbar from '../components/Navbar.jsx';
import VideoCard from '../components/VideoCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data.categories || []);
        }
      } catch (err) {
        console.warn('Failed to load categories');
      }
    }
    fetchCategories();
  }, []);

  // Load videos based on role and filters
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: 12,
        };
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;

        const res = await api.get('/videos', { params });
        if (res.data.success) {
          setVideos(res.data.data.videos || []);
          setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Failed to load videos:', err);
        setError(err.response?.data?.message || 'Gagal memuat video.');
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [currentCategory, currentSearch, currentPage]);

  const handleCategorySelect = (slug) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug) {
      nextParams.set('category', slug);
    } else {
      nextParams.delete('category');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleSearchChange = (val) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val) {
      nextParams.set('search', val);
    } else {
      nextParams.delete('search');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* User Role Welcome Banner */}
        <div className="mb-8 p-6 rounded-3xl glass-panel border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Role: {user?.role?.name || 'MEMBER'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ruang Belajar Anda
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Menampilkan video tutorial yang dapat diakses oleh role akun Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Akses Video:</span>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white">
              {pagination.total} Video
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                !currentCategory
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Semua Kategori
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  currentCategory === cat.slug
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Active search filter clear */}
          {currentSearch && (
            <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
              <span className="text-slate-400">Pencarian:</span>
              <strong className="text-white">"{currentSearch}"</strong>
              <button
                onClick={() => handleSearchChange('')}
                className="p-0.5 hover:text-red-400 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingSpinner text="Memuat video tutorial..." />
        ) : error ? (
          <EmptyState
            title="Gagal Memuat Video"
            description={error}
            actionText="Muat Ulang"
            onAction={() => window.location.reload()}
          />
        ) : videos.length === 0 ? (
          <EmptyState
            title="Tidak Ada Video"
            description={
              currentSearch || currentCategory
                ? 'Tidak ada video yang cocok dengan filter atau pencarian Anda.'
                : 'Belum ada video tutorial yang diterbitkan untuk role Anda saat ini.'
            }
            actionText={currentSearch || currentCategory ? 'Reset Filter' : null}
            onAction={() => {
              setSearchParams(new URLSearchParams());
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                        currentPage === p
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
