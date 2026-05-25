'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

function TLMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 133.91 122.64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M132.07,30.67c-1.84-7.9-5.5-15.32-11.17-21.12-25.65-26.27-60.08,6.57-68.61,38.85h0c-5.15,17.62-7.08,38.58,4.11,54.59-15.78-.09-37.51-3.93-43.7-20.4-4.14-17.3,16.12-29.21,30.77-32.61.6-2.33,1.29-4.73,2.11-7C-25.65,55.51-6.93,122.31,57.21,122.6c58.67,1.72,84.05-52.55,74.86-91.92ZM112.31,47.68c-1.41,13.28-11.89,47.54-33.33,51.77-2.59.51-5.27.41-7.78-.4-17.94-5.83-18.06-35.94-12.19-51.02,29.97-.12,40.99,16.13,40.99,16.13,1.35-3.59,2.44-7.34,3.24-11.18-16.52-12.08-41.66-11.28-41.66-11.28C76.94,7.26,117.59.11,112.31,47.68Z" fill="currentColor"/>
    </svg>
  );
}

export default function JudgeLoginPage() {
  const router = useRouter();
  const [siebelId, setSiebelId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/judge/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siebelId, password }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Login failed.');
        return;
      }
      router.push('/judge/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, var(--tl-cream) 0%, #ffffff 60%, #f0f8fa 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <TLMark className="w-7 h-7 text-tl-logo-red" />
          <span className="text-slate-900 font-bold text-base tracking-tight">TrendLife · Go AI-Native</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
          style={{ boxShadow: '0 8px 40px rgba(15,98,114,0.10)' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--tl-red), var(--tl-burgundy))' }}>
              <TLMark className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--tl-teal)' }}>Judges&apos; Corner</p>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sign in</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-sm mb-1.5">Siebel ID</label>
              <input
                type="text"
                required
                value={siebelId}
                onChange={e => setSiebelId(e.target.value)}
                placeholder="e.g. ribenitor"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                style={{ outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--tl-teal)')}
                onBlur={e => (e.target.style.borderColor = '')}
              />
            </div>

            <div>
              <label className="block text-slate-600 text-sm mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Judge access password"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                onFocus={e => (e.target.style.borderColor = 'var(--tl-teal)')}
                onBlur={e => (e.target.style.borderColor = '')}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
              style={{ background: 'var(--tl-red)' }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = 'var(--tl-burgundy)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.background = 'var(--tl-red)')}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Enter Judges' Corner"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Trend Micro · Go AI-Native Hackathon 2026</p>
      </div>
    </div>
  );
}
