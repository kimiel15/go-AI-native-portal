'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Info, Bell, ArrowRight } from 'lucide-react';

type AnnouncementType = 'tip' | 'reminder';

interface Announcement {
  type: AnnouncementType;
  tag: string;
  title: string;
  body: string;
  date: string;
  link?: string;
  linkLabel?: string;
  external?: boolean;
}

const DURATION = 6000;

const announcements: Announcement[] = [
  {
    type: 'reminder',
    tag: 'Reminder',
    title: 'Start Registering Your Team',
    body: 'Team registration is now open. Form your team of 3–4 members and complete registration before June 7. Each member must have an active GitHub EMU account before the build phase begins.',
    date: 'Posted May 28, 2026',
    link: '/register',
    linkLabel: 'Register Now',
  },
  {
    type: 'tip',
    tag: 'Build Guide',
    title: 'The Build Guide is Live',
    body: 'Your end-to-end reference from problem to submission — identify the problem, lock the baseline, build the tool, measure the impact, and submit the evidence. Use it as your thinking guide at every stage.',
    date: 'Posted May 28, 2026',
    link: '/build-guide.html',
    linkLabel: 'Open Build Guide',
    external: true,
  },
];

const typeConfig: Record<AnnouncementType, {
  bar: string;
  tag: string;
  icon: React.ReactNode;
}> = {
  tip: {
    bar: 'bg-gradient-to-b from-tl-teal to-tl-sky',
    tag: 'text-tl-teal bg-teal-50 border border-teal-200',
    icon: <Info className="w-2.5 h-2.5" />,
  },
  reminder: {
    bar: 'bg-gradient-to-b from-amber-400 to-orange-500',
    tag: 'text-amber-700 bg-amber-50 border border-amber-200',
    icon: <Bell className="w-2.5 h-2.5" />,
  },
};

export default function AnnouncementsCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((n: number) => {
    setCurrent((n + announcements.length) % announcements.length);
    setSlideKey(k => k + 1);
  }, []);

  const move = useCallback((dir: number) => {
    setCurrent(prev => {
      const next = (prev + dir + announcements.length) % announcements.length;
      setSlideKey(k => k + 1);
      return next;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => move(1), DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, paused, move]);

  const a = announcements[current];
  const cfg = typeConfig[a.type];

  return (
    <>
      <style>{`
        @keyframes announceFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes announceProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .announce-slide {
          animation: announceFadeIn 0.3s ease both;
        }
        .announce-progress {
          animation: announceProgress ${DURATION}ms linear forwards;
        }
      `}</style>

      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6">
          Announcements
        </h2>

        <div className="relative">
          {/* Prev arrow */}
          <button
            onClick={() => move(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:shadow-md transition-all"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Card */}
          <div
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Progress bar */}
            <div className="h-0.5 bg-gray-100 overflow-hidden">
              <div
                key={slideKey}
                className="announce-progress h-full bg-gradient-to-r from-tl-red to-tl-orange"
                style={{ animationPlayState: paused ? 'paused' : 'running' }}
              />
            </div>

            {/* Slide content */}
            <div key={`slide-${slideKey}`} className="announce-slide flex gap-5 p-7">
              {/* Accent bar */}
              <div className={`w-1 rounded-full flex-shrink-0 self-stretch min-h-[80px] ${cfg.bar}`} />

              {/* Body */}
              <div className="flex-1 min-w-0">
                {/* Type tag */}
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 ${cfg.tag}`}>
                  {cfg.icon}
                  {a.tag}
                </span>

                <h3 className="text-slate-900 font-bold text-base leading-snug mb-2">{a.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{a.body}</p>

                <div className="flex items-center gap-4 mt-4">
                  {a.link && (
                    a.external ? (
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-tl-red hover:text-tl-burgundy transition-colors group"
                      >
                        {a.linkLabel}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <Link
                        href={a.link}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-tl-red hover:text-tl-burgundy transition-colors group"
                      >
                        {a.linkLabel}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )
                  )}
                  <p className="text-slate-300 text-[11px]">{a.date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={() => move(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:shadow-md transition-all"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-4">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to announcement ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === current ? 'w-5 bg-tl-red' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
