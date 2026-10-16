import {
  ArrowRight,
  CheckCircle2,
  Compass,
  FolderTree,
  Lock,
  PlaySquare,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function LandingPage() {
  const { isAuthenticated, isActive } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data.categories || []);
        }
      } catch (err) {
        console.warn('Could not load categories for landing preview');
      }
    }
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-accent-600/15 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-brand-300 mb-8 backdrop-blur-md shadow-lg shadow-brand-500/5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Personal Video Tutorial Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight sm:leading-none">
            Ruang Belajar Mandiri. <br />
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-accent-400 bg-clip-text text-transparent">
              Learn something new, your way.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Kumpulkan, kelompokkan, dan nikmati kurasi video tutorial YouTube pilihan dalam satu platform teratur, aman, dan tanpa distraksi.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 px-2">
            <div className="relative flex items-center shadow-2xl rounded-2xl bg-slate-900/90 border border-slate-700/60 p-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Cari tutorial programming, gaming, data analyst..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shrink-0 shadow-lg shadow-brand-600/30"
              >
                Cari Tutorial
              </button>
            </div>
          </form>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={isActive ? '/dashboard' : '/pending'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 transition-all shadow-xl shadow-brand-600/25"
              >
                <span>Buka Dashboard Video</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-xl shadow-brand-600/25"
                >
                  <span>Daftar Akun Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all"
                >
                  <span>Masuk Akun</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4">
                <FolderTree className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Kategori & Subkategori Teratur</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Kelompokkan materi ke dalam struktur induk dan anak (misal: Edukasi &rarr; Programming) agar pencarian tutorial selalu cepat dan sistematis.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/30 flex items-center justify-center text-accent-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Akses Berbasis Role</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Setiap materi diproteksi oleh role khusus (Education, Gaming, dll). Hanya teman dan pengguna terverifikasi yang dapat mengakses konten terkait.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <PlaySquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pemutar Video Terintegrasi</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tonton video tutorial pilihan secara langsung dengan pemutar responsif, catatan materi yang terstruktur, dan navigasi video terkait yang nyaman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Jelajahi Topik Belajar</h2>
                <p className="text-sm text-slate-400">Pilih kategori utama untuk menemukan modul video</p>
              </div>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800 block group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {cat._count?.videos || 0} video
                    </span>
                  </div>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {cat.subcategories.slice(0, 4).map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {cat.subcategories.length > 4 && (
                        <span className="text-[11px] px-1.5 py-0.5 text-slate-400">
                          +{cat.subcategories.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
