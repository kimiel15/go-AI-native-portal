'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, LogOut, ClipboardList, Users } from 'lucide-react';

function TLMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 133.91 122.64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M132.07,30.67c-1.84-7.9-5.5-15.32-11.17-21.12-25.65-26.27-60.08,6.57-68.61,38.85h0c-5.15,17.62-7.08,38.58,4.11,54.59-15.78-.09-37.51-3.93-43.7-20.4-4.14-17.3,16.12-29.21,30.77-32.61.6-2.33,1.29-4.73,2.11-7C-25.65,55.51-6.93,122.31,57.21,122.6c58.67,1.72,84.05-52.55,74.86-91.92ZM112.31,47.68c-1.41,13.28-11.89,47.54-33.33,51.77-2.59.51-5.27.41-7.78-.4-17.94-5.83-18.06-35.94-12.19-51.02,29.97-.12,40.99,16.13,40.99,16.13,1.35-3.59,2.44-7.34,3.24-11.18-16.52-12.08-41.66-11.28-41.66-11.28C76.94,7.26,117.59.11,112.31,47.68Z" fill="currentColor"/>
    </svg>
  );
}

export default function NavBar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="border-b border-tl-teal-light/40 bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <TLMark className="w-7 h-7 text-tl-logo-red" />
          <div>
            <span className="text-slate-900 font-bold text-sm tracking-tight leading-none">Go AI-Native</span>
            <span className="block text-slate-400 text-xs leading-none">AI Tech Challenge Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-tl-teal to-tl-sky flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
              </div>
              <span className="text-slate-700 text-sm hidden sm:block truncate max-w-[160px]">
                {user.name ?? user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/signin' })}
                title="Sign out"
                className="flex items-center gap-1 text-slate-400 hover:text-tl-teal transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <Link href="/squad-lead" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-tl-teal transition-colors">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Managers&apos; View</span>
          </Link>
          <Link href="/teams" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-tl-teal transition-colors">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Teams</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
