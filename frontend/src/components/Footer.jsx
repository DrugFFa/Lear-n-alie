import { Heart, PlaySquare, Shield } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white">
              <PlaySquare className="w-4 h-4 fill-white/20 stroke-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                Lear<span className="text-brand-400">(n)</span>alie
              </span>
              <p className="text-xs text-slate-400">Personal Video Tutorial Platform</p>
            </div>
          </div>

          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-slate-300">
              <span className="italic font-semibold text-brand-400">"Learn something new, your way."</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Kurasi tutorial YouTube terorganisir, aman, dan mudah diakses sesuai minat belajar Anda.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <Shield className="w-3 h-3 text-emerald-400" />
              Role Protected
            </span>
            <span>&copy; {new Date().getFullYear()} Lear(n)alie</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
