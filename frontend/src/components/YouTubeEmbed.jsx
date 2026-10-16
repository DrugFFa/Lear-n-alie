import { AlertCircle, Play } from 'lucide-react';
import React, { useState } from 'react';

export default function YouTubeEmbed({ youtubeId, title = 'YouTube Video Player', autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  if (!youtubeId) {
    return (
      <div className="aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-slate-400">
        <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-sm">Video ID tidak valid atau tidak ditemukan.</p>
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  const fallbackThumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
      {!isPlaying ? (
        <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
          {/* High-res / Fallback Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackThumbnail;
            }}
          />

          {/* Dark gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
            {/* Play button with pulsing halo */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-brand-500/30 blur-md group-hover:bg-brand-500/50 transition-all animate-pulse"></div>
              <button
                type="button"
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-2xl transition-transform transform group-hover:scale-110"
                aria-label={`Putar video: ${title}`}
              >
                <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white ml-1" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-left">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/90 text-brand-300 border border-slate-700/60 inline-block mb-1.5">
              Klik untuk Menonton
            </span>
            <p className="text-sm sm:text-base font-semibold text-white drop-shadow line-clamp-1">{title}</p>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      )}
    </div>
  );
}
