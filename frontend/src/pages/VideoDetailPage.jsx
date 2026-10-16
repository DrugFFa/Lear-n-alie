import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  ExternalLink,
  Folder,
  PlaySquare,
  Shield,
  Sparkles
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import Footer from '../components/Footer.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Navbar from '../components/Navbar.jsx';
import VideoCard from '../components/VideoCard.jsx';
import YouTubeEmbed from '../components/YouTubeEmbed.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function VideoDetailPage() {
  const { slug } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/videos/${slug}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Akses ditolak. Role akun Anda tidak diizinkan untuk menonton tutorial ini.');
        } else if (err.response?.status === 404) {
          setError('Video tidak ditemukan atau belum dipublikasikan.');
        } else {
          setError(err.response?.data?.message || 'Gagal memuat video.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <LoadingSpinner fullScreen text="Memuat pemutar video..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
          <EmptyState
            title="Video Tidak Dapat Diakses"
            description={error}
            actionText="Kembali ke Dashboard"
            actionLink="/dashboard"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const { video, relatedVideos } = data;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          {isAdmin && (
            <Link
              to={`/admin/videos/${video.id}/edit`}
              className="text-xs font-semibold px-3 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500/20"
            >
              Edit Video Ini (Admin)
            </Link>
          )}
        </div>

        {/* Video Player & Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Embedded Video */}
            <YouTubeEmbed youtubeId={video.youtubeId} title={video.title} autoPlay={true} />

            {/* Video Title & Meta Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {video.category && (
                  <Link
                    to={`/categories/${video.category.slug}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500/20"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    {video.category.name}
                  </Link>
                )}

                {video.status === 'DRAFT' && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    DRAFT (ADMIN ONLY)
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-xs text-slate-400 ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(video.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {video.title}
              </h1>
            </div>

            {/* Description Box */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
                Deskripsi Tutorial
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                {video.description}
              </p>
            </div>

            {/* Role & Access Info */}
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-brand-400" />
                Role yang Diizinkan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {video.allowedRoles && video.allowedRoles.length > 0 ? (
                  video.allowedRoles.map((ar) => (
                    <span
                      key={ar.roleId}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-semibold border border-slate-700"
                    >
                      {ar.role?.name || ar.roleId}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">Semua role aktif</span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Related Videos */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlaySquare className="w-4 h-4 text-brand-400" />
              <span>Video Terkait</span>
            </h3>

            {relatedVideos && relatedVideos.length > 0 ? (
              <div className="space-y-4">
                {relatedVideos.map((item) => (
                  <VideoCard key={item.id} video={item} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-center text-xs text-slate-400">
                Tidak ada video terkait lainnya dalam kategori ini.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
