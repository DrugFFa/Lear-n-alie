import { ArrowLeft, HelpCircle } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">404 — Tidak Ditemukan</h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            Halaman atau konten yang Anda cari tidak tersedia atau tautan sudah kadaluarsa.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
