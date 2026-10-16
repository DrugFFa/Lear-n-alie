import { Inbox } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'Tidak ada data ditemukan',
  description = 'Belum ada konten yang tersedia untuk kategori atau pencarian ini.',
  actionText = null,
  actionLink = null,
  onAction = null,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl max-w-md mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-brand-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
