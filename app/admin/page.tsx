import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Zap, ArrowLeft, UserCheck } from 'lucide-react';
import { auth, signIn } from '@/auth';
import { ELEVATION_COOKIE, verifyElevation } from '@/lib/admin-elevation';
import PasswordForm from './PasswordForm';

export default async function AdminLandingPage() {
  const session = await auth();
  const email = session?.user?.email ?? undefined;

  // Already elevated? Skip the form.
  const elevationToken = (await cookies()).get(ELEVATION_COOKIE)?.value;
  if (email && (await verifyElevation(elevationToken, email))) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/30">
            <Zap className="w-7 h-7 text-white" />
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
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-800 text-sm">
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
