import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { ELEVATION_COOKIE, verifyElevation } from '@/lib/admin-elevation';
import PasswordForm from './PasswordForm';

function TLMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 133.91 122.64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M132.07,30.67c-1.84-7.9-5.5-15.32-11.17-21.12-25.65-26.27-60.08,6.57-68.61,38.85h0c-5.15,17.62-7.08,38.58,4.11,54.59-15.78-.09-37.51-3.93-43.7-20.4-4.14-17.3,16.12-29.21,30.77-32.61.6-2.33,1.29-4.73,2.11-7C-25.65,55.51-6.93,122.31,57.21,122.6c58.67,1.72,84.05-52.55,74.86-91.92ZM112.31,47.68c-1.41,13.28-11.89,47.54-33.33,51.77-2.59.51-5.27.41-7.78-.4-17.94-5.83-18.06-35.94-12.19-51.02,29.97-.12,40.99,16.13,40.99,16.13,1.35-3.59,2.44-7.34,3.24-11.18-16.52-12.08-41.66-11.28-41.66-11.28C76.94,7.26,117.59.11,112.31,47.68Z" fill="currentColor"/>
    </svg>
  );
}

export default async function AdminLandingPage() {
  const session = await auth();
  const email = session?.user?.email ?? undefined;

  // Already elevated? Skip the form.
  const elevationToken = (await cookies()).get(ELEVATION_COOKIE)?.value;
  if (email && (await verifyElevation(elevationToken, email))) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, var(--tl-cream) 0%, #ffffff 60%, #f0f8fa 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-tl-red/20"
            style={{ background: 'linear-gradient(135deg, var(--tl-red), var(--tl-burgundy))' }}>
            <TLMark className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">Go AI-Native · Admin Dashboard</p>
        </div>

        {!session ? (
          <form
            action={async () => {
              'use server';
              await signIn('microsoft-entra-id', { redirectTo: '/admin' });
            }}
            className="bg-white border border-gray-200 rounded-2xl p-8 space-y-4 text-center"
          >
            <p className="text-slate-600 text-sm">
              Step 1 — sign in with your Trend Micro account so we know who&apos;s logging in.
            </p>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Sign in with Microsoft
            </button>
          </form>
        ) : (
          <>
            <div className="bg-tl-teal-light/20 border border-tl-teal-light rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-tl-teal flex-shrink-0" />
              <p className="text-tl-teal text-sm">
                Signed in as <strong>{session.user?.name ?? email}</strong>
              </p>
            </div>
            <p className="text-slate-500 text-sm mb-4 text-center">
              Step 2 — enter the admin password to unlock the dashboard.
            </p>
            <PasswordForm />
          </>
        )}

        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
