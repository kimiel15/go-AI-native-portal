'use client';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Zap, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Go AI-Native</h1>
          <p className="text-slate-400 text-sm mt-1">RoW Support · AI Hackathon Portal</p>
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
