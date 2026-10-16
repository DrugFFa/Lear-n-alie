import { Clock, LogOut, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function PendingPage() {
  const { user, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const updatedUser = await refreshUser();
      if (updatedUser?.status === 'ACTIVE') {
        navigate('/dashboard', { replace: true });
      } else {
        setMessage('Status akun Anda masih PENDING. Harap menunggu konfirmasi admin.');
      }
    } catch {
      setMessage('Gagal memperbarui status. Silakan coba lagi nanti.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 text-center relative overflow-hidden shadow-2xl">
          {/* Accent decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

          {/* Animated icon */}
          <div className="relative inline-flex mb-6">
            <div className="absolute -inset-2 rounded-full bg-amber-500/20 blur-md animate-pulse"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
              <Clock className="w-10 h-10 animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Akun Menunggu Persetujuan
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Halo <strong className="text-white">{user?.name || 'Teman'}</strong>, terima kasih telah mendaftar di Lear(n)alie. Administrator sedang meninjau akun Anda dan akan segera menetapkan role akses yang sesuai.
          </p>

          {/* Account Detail Box */}
          <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800/80 mb-6 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Email Terdaftar:</span>
              <span className="font-medium text-slate-200">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status Saat Ini:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PENDING
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Role:</span>
              <span className="text-slate-400 italic">Menunggu penetapan admin</span>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 text-xs">
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Memeriksa...' : 'Periksa Status Saya'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
