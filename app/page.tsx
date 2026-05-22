import Link from 'next/link';
import { Users, FileText, Brain, LayoutDashboard, ArrowRight, Zap, Calendar } from 'lucide-react';

const menuItems = [
  {
    icon: Users,
    label: 'Team Registration',
    desc: 'Register your team of 3–4',
    href: '/register',
    color: 'from-red-500 to-rose-600',
    badge: 'Team',
  },
  {
    icon: FileText,
    label: 'Project Submission',
    desc: 'View and submit projects',
    href: '/submissions',
    color: 'from-rose-500 to-pink-600',
    badge: 'Submit',
  },
  {
    icon: Brain,
    label: 'AI Proficiency Assessment',
    desc: 'Take the individual assessment',
    href: '/assessment',
    color: 'from-orange-500 to-red-500',
    badge: 'Individual',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Nav */}
      <nav className="border-b border-red-100 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-base tracking-tight">Go AI-Native</span>
          </div>

          {/* Primary menu */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-red-50 transition-all"
              >
                <Icon className="w-4 h-4 text-red-400 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          <Link href="/admin" className="flex-shrink-0 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-red-50 px-4 py-2 flex gap-2 overflow-x-auto">
          {menuItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-red-50 border border-gray-200 transition-all"
            >
              <Icon className="w-3.5 h-3.5 text-red-400" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-700 text-sm font-medium">RoW Support · AI Acceleration Hackathon</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
          Go{' '}
          <span className="bg-gradient-to-r from-red-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
            AI-Native
          </span>
        </h1>

        <p className="text-lg font-semibold text-slate-500 mb-2 tracking-wide">
          40% efficiency · 20% added value · 100% AI-Native
        </p>
        <p className="text-slate-400 text-sm mb-2">Build with Claude. Ship in Git.</p>

        <p className="text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Every team in RoW Support builds a Claude-powered tool, runs it on real production cases,
          and proves measurable impact.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/register"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/submissions"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold px-8 py-3.5 rounded-xl transition-all border border-gray-200">
            <FileText className="w-4 h-4" /> View Submissions
          </Link>
        </div>
      </section>

      {/* Menu Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
          Participant Portal
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map(({ icon: Icon, label, desc, href, color, badge }, i) => (
            <Link key={href} href={href} className="group block">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:border-gray-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-black text-slate-300 group-hover:text-slate-400 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="inline-block text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">{badge}</span>
                  <h3 className="text-slate-900 font-bold text-lg leading-snug">{label}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold group-hover:gap-3 transition-all">
                  Open <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
          June 2026 Timeline
        </h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { phase: 'Build', dates: 'Jun 1–14', desc: 'Pick a problem. Declare in Git. Build your tool.', color: 'border-red-200 bg-red-50' },
            { phase: 'Run in Production', dates: 'Jun 15–21', desc: 'Deploy on real cases. Capture measured results.', color: 'border-rose-200 bg-rose-50' },
            { phase: 'Event Prep', dates: 'Jun 22–26', desc: 'Judges verify results. Awards locked.', color: 'border-pink-200 bg-pink-50' },
            { phase: 'Main Event', dates: 'Jun 27 🎉', desc: 'Recognition, celebration, Roll Call, four awards.', color: 'border-amber-200 bg-amber-50' },
          ].map(({ phase, dates, desc, color }) => (
            <div key={phase} className={`border ${color} rounded-2xl p-5`}>
              <p className="text-slate-900 font-bold text-sm mb-1">{phase}</p>
              <p className="text-slate-400 text-xs font-mono mb-3">{dates}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Judging Criteria */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
          Judging Criteria
        </h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 bg-red-600 px-6 py-3">
            <p className="col-span-4 text-white text-xs font-semibold uppercase tracking-wide">Criteria</p>
            <p className="col-span-6 text-white text-xs font-semibold uppercase tracking-wide">Description</p>
            <p className="col-span-2 text-white text-xs font-semibold uppercase tracking-wide text-right">Weight</p>
          </div>
          {[
            { criteria: 'Business Value',               desc: 'Is there a clear link to revenue growth, retention, or operational efficiency?',                                  weight: '30%', top: true  },
            { criteria: 'Problem Clarity',              desc: 'Is the business problem clearly defined and well-understood?',                                                    weight: '25%', top: false },
            { criteria: 'Solution Effectiveness',       desc: 'Does the solution directly address the problem and produce accurate, useful, and consistent outputs?',           weight: '20%', top: false },
            { criteria: 'AI Integration & Reusability', desc: 'Is Claude meaningfully embedded as a core enabler, and can the solution be easily adopted by other engineers?',  weight: '15%', top: false },
            { criteria: 'Production Evidence',           desc: 'Was the tool deployed and run on real production cases? Evidence must show when, where, how many cases, and who authorized the run.',  weight: '10%', top: false },
          ].map(({ criteria, desc, weight, top }, i, arr) => (
            <div key={criteria} className={`grid grid-cols-12 px-6 py-4 items-start ${i < arr.length - 1 ? 'border-b border-gray-100' : ''} ${top ? 'bg-red-50' : ''}`}>
              <p className={`col-span-4 text-sm font-semibold ${top ? 'text-red-700' : 'text-slate-900'}`}>{criteria}</p>
              <p className="col-span-6 text-slate-500 text-sm leading-relaxed">{desc}</p>
              <p className={`col-span-2 text-right text-sm font-bold ${top ? 'text-red-600' : 'text-slate-700'}`}>{weight}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-slate-400 text-sm">
        Go AI-Native · RoW Support AI Acceleration Hackathon · June 27, 2026
      </footer>
    </div>
  );
}
