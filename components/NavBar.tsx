'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Zap, Home, LogOut } from 'lucide-react';

export default function NavBar() {
  const { data: session } = useSession();
  const user = session?.user;

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

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-700 text-sm hidden sm:block truncate max-w-[160px]">
                {user.name ?? user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/signin' })}
                title="Sign out"
                className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
