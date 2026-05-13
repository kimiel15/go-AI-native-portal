'use client';
import Link from 'next/link';
import { Zap, Home } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="border-b border-red-100 bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-slate-900 font-bold text-sm tracking-tight leading-none">Go AI-Native</span>
            <span className="block text-slate-400 text-xs leading-none">AI Hackathon Portal</span>
          </div>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <Home className="w-4 h-4" /> Home
        </Link>
      </div>
    </nav>
  );
}
