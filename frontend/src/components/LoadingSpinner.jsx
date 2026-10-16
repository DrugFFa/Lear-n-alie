import { Loader2 } from 'lucide-react';
import React from 'react';

export default function LoadingSpinner({ text = 'Memuat data...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide text-slate-400">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-400">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
