import { Eye, Folder, Play, Shield } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function VideoCard({ video, showAdminMeta = false }) {
  const thumbnailUrl = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <Link
      to={`/videos/${video.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden glass-panel glass-panel-hover border border-slate-800/80 transition-all duration-300"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback placeholder if youtube thumbnail fails
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Category Pill */}
        {video.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700/50">
              <Folder className="w-3 h-3 text-brand-400" />
              {video.category.name}
            </span>
          </div>
        )}

        {/* Status Pill for Admin */}
        {showAdminMeta && (
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                video.status === 'PUBLISHED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              {video.status}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-2 mb-2 leading-snug">
          {video.title}
        </h4>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-1">
          {video.description}
        </p>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          {/* Allowed Roles */}
          <div className="flex items-center gap-1 overflow-hidden">
            <Shield className="w-3 h-3 text-brand-400 shrink-0" />
            <span className="truncate">
              {video.allowedRoles && video.allowedRoles.length > 0
                ? video.allowedRoles.map((ar) => ar.role?.name || ar.roleId).join(', ')
                : 'Protected'}
            </span>
          </div>

          <span className="text-slate-400 shrink-0">
            {new Date(video.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
