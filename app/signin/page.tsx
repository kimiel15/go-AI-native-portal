'use client';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Shield } from 'lucide-react';

function TLMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 133.91 122.64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M132.07,30.67c-1.84-7.9-5.5-15.32-11.17-21.12-25.65-26.27-60.08,6.57-68.61,38.85h0c-5.15,17.62-7.08,38.58,4.11,54.59-15.78-.09-37.51-3.93-43.7-20.4-4.14-17.3,16.12-29.21,30.77-32.61.6-2.33,1.29-4.73,2.11-7C-25.65,55.51-6.93,122.31,57.21,122.6c58.67,1.72,84.05-52.55,74.86-91.92ZM112.31,47.68c-1.41,13.28-11.89,47.54-33.33,51.77-2.59.51-5.27.41-7.78-.4-17.94-5.83-18.06-35.94-12.19-51.02,29.97-.12,40.99,16.13,40.99,16.13,1.35-3.59,2.44-7.34,3.24-11.18-16.52-12.08-41.66-11.28-41.66-11.28C76.94,7.26,117.59.11,112.31,47.68Z" fill="currentColor"/>
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" aria-hidden>
      <rect x="0"  y="0"  width="10" height="10" fill="#F25022" />
      <rect x="11" y="0"  width="10" height="10" fill="#7FBA00" />
      <rect x="0"  y="11" width="10" height="10" fill="#00A4EF" />
      <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function SignInContent() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const error = params.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, var(--tl-cream) 0%, #ffffff 60%, #f0f8fa 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-tl-red/20"
            style={{ background: 'linear-gradient(135deg, var(--tl-red), var(--tl-burgundy))' }}>
            <TLMark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Go AI-Native</h1>
          <p className="text-slate-400 text-sm mt-1">RoW Support · AI Tech Challenge Portal</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-700 text-sm text-center">
            {error === 'AccessDenied'
              ? 'Access denied — please sign in with your @trendmicro.com account.'
              : 'Sign-in failed. Please try again.'}
          </div>
        )}

        {/* Sign-in card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
          <div>
            <p className="text-slate-900 font-semibold text-center">Sign in to continue</p>
            <p className="text-slate-400 text-sm text-center mt-1">Use your Trend Micro Microsoft account</p>
          </div>

          <button
            onClick={() => signIn('microsoft-entra-id', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl px-6 py-3.5 text-slate-700 font-semibold transition-all shadow-sm hover:shadow"
          >
            <MicrosoftLogo />
            Sign in with Microsoft
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Trend Micro employees only · @trendmicro.com accounts</span>
        </div>
      </div>
    </div>
  );
}

// useSearchParams requires Suspense boundary in Next.js App Router
export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
