import { ArrowLeft, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function ForbiddenPage() {
  const location = useLocation();
  const reason = location.state?.reason || 'Anda tidak memiliki hak akses atau izin untuk melihat halaman ini.';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">403 — Akses Ditolak</h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-8">{reason}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ke Dashboard</span>
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all"
            >
              <span>Halaman Utama</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
