import Link from 'next/link';
import { Users, FileText, Brain, LayoutDashboard, ArrowRight, Calendar, ClipboardList } from 'lucide-react';

function TLMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 133.91 122.64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M132.07,30.67c-1.84-7.9-5.5-15.32-11.17-21.12-25.65-26.27-60.08,6.57-68.61,38.85h0c-5.15,17.62-7.08,38.58,4.11,54.59-15.78-.09-37.51-3.93-43.7-20.4-4.14-17.3,16.12-29.21,30.77-32.61.6-2.33,1.29-4.73,2.11-7C-25.65,55.51-6.93,122.31,57.21,122.6c58.67,1.72,84.05-52.55,74.86-91.92ZM112.31,47.68c-1.41,13.28-11.89,47.54-33.33,51.77-2.59.51-5.27.41-7.78-.4-17.94-5.83-18.06-35.94-12.19-51.02,29.97-.12,40.99,16.13,40.99,16.13,1.35-3.59,2.44-7.34,3.24-11.18-16.52-12.08-41.66-11.28-41.66-11.28C76.94,7.26,117.59.11,112.31,47.68Z" fill="currentColor"/>
    </svg>
  );
}

const menuItems = [
  {
    icon: Users,
    label: 'Team Registration',
    desc: 'Register your team of 3–4',
    href: '/register',
    color: 'from-tl-red to-tl-burgundy',
    badge: 'Team',
  },
  {
    icon: FileText,
    label: 'Project Submission',
    desc: 'View and submit projects',
    href: '/submissions',
    color: 'from-tl-teal to-tl-sky',
    badge: 'Submit',
  },
  {
    icon: Brain,
    label: 'AI Proficiency Assessment',
    desc: 'Take the individual assessment',
    href: '/assessment',
    color: 'from-tl-orange to-tl-red',
    badge: 'Individual',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, var(--tl-cream) 0%, #ffffff 60%, #f0f8fa 100%)' }}>
      {/* Nav */}
      <nav className="border-b border-tl-teal-light/40 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <TLMark className="w-7 h-7 text-tl-logo-red" />
            <span className="text-slate-900 font-bold text-base tracking-tight">Go AI-Native</span>
          </div>

          {/* Primary menu */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-tl-cream transition-all"
              >
                <Icon className="w-4 h-4 text-tl-red flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/squad-lead" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-tl-teal transition-colors">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Managers&apos; View</span>
            </Link>
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-tl-teal-light/20 px-4 py-2 flex gap-2 overflow-x-auto">
          {menuItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-tl-cream border border-gray-200 transition-all"
            >
              <Icon className="w-3.5 h-3.5 text-tl-red" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-tl-cream border border-tl-teal-light/60 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-tl-red animate-pulse" />
          <span className="text-tl-teal text-sm font-medium">RoW Support · AI Acceleration Hackathon</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
          Go{' '}
          <span className="bg-gradient-to-r from-tl-red via-tl-orange to-tl-teal bg-clip-text text-transparent">
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
            className="flex items-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-tl-red/25 hover:shadow-tl-red/40">
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
                  <span className="inline-block text-xs font-semibold text-tl-teal uppercase tracking-wider mb-2">{badge}</span>
                  <h3 className="text-slate-900 font-bold text-lg leading-snug">{label}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
                <div className="flex items-center gap-2 text-tl-red text-sm font-semibold group-hover:gap-3 transition-all">
                  Open <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Calendar of Activities */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
          Calendar of Activities
        </h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-tl-red">
                <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-6 py-3 w-[25%]">Important Date/s</th>
                <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-6 py-3 w-[25%]">Phase</th>
                <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-6 py-3 w-[50%]">Task</th>
              </tr>
            </thead>
            <tbody>
              {/* Kick Off */}
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono align-top">May 28</td>
                <td className="px-6 py-4 text-sm font-semibold text-tl-teal align-top">Kick Off</td>
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1.5">
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Announce &amp; share details during Town Hall Session</li>
                  </ul>
                </td>
              </tr>
              {/* Build & Registration — June 1–7 (phase cell spans 2 rows) */}
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono align-top">June 1 – 7</td>
                <td className="px-6 py-4 text-sm font-semibold text-tl-teal align-middle" rowSpan={2}>Build &amp; Registration Phase</td>
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1.5">
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Start building Claude projects and complete team registration</li>
                  </ul>
                </td>
              </tr>
              {/* Build & Registration — June 8–14 (no phase cell, spanned above) */}
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono align-top">June 8 – 14</td>
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1.5">
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Test and validate results then launch to production</li>
                  </ul>
                </td>
              </tr>
              {/* Run Phase */}
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono align-top">June 15 – 21</td>
                <td className="px-6 py-4 text-sm font-semibold text-tl-teal align-top">Run Phase</td>
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1.5">
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Run projects in production</li>
                  </ul>
                </td>
              </tr>
              {/* Measure & Document */}
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono align-top">June 22 – 24</td>
                <td className="px-6 py-4 text-sm font-semibold text-tl-teal align-top">Measure &amp; Document</td>
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1.5">
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Complete results &amp; documentation and upload in Github EMU</li>
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Run assessment (starting June 22)</li>
                  </ul>
                </td>
              </tr>
              {/* Validation */}
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono align-top">June 25 – 26</td>
                <td className="px-6 py-4 text-sm font-semibold text-tl-teal align-top">Validation</td>
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1.5">
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Deliberate results and identify winners</li>
                  </ul>
                </td>
              </tr>
              {/* Main Event */}
              <tr className="bg-yellow-50">
                <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono align-top">June 27</td>
                <td className="px-6 py-4 text-sm font-semibold text-yellow-700 align-top">Go AI-Native Day! 🎉</td>
                <td className="px-6 py-4 align-top">
                  <ul className="space-y-1.5">
                    <li className="text-slate-500 text-sm leading-relaxed flex gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />Recap event and recognize winners</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Judging Criteria */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
          Judging Criteria
        </h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 bg-tl-teal px-6 py-3">
            <p className="col-span-4 text-white text-xs font-semibold uppercase tracking-wide">Criteria</p>
            <p className="col-span-6 text-white text-xs font-semibold uppercase tracking-wide">Description</p>
            <p className="col-span-2 text-white text-xs font-semibold uppercase tracking-wide text-right">Weight</p>
          </div>
          {[
            { criteria: 'Business Value',               desc: 'Is there a clear link to revenue growth or volume reduction?',                                                                          weight: '30%', top: true  },
            { criteria: 'Solution Effectiveness',       desc: 'Does the solution — whether a tool, skill or plugin — directly address the problem and produce accurate, useful, and consistent outputs?', weight: '20%', top: false },
            { criteria: 'Production Evidence',          desc: 'Was the tool deployed and run on real production cases? Evidence must show when, where, how many cases, and who authorized the run.',    weight: '20%', top: false },
            { criteria: 'Problem Clarity',              desc: 'Is the business problem clearly defined and well-understood?',                                                                           weight: '15%', top: false },
            { criteria: 'AI Integration & Reusability', desc: 'Is Claude meaningfully embedded as a core enabler, and can the solution be easily adopted by other engineers?',                         weight: '15%', top: false },
          ].map(({ criteria, desc, weight, top }, i, arr) => (
            <div key={criteria} className={`grid grid-cols-12 px-6 py-4 items-start ${i < arr.length - 1 ? 'border-b border-gray-100' : ''} ${top ? 'bg-tl-cream' : ''}`}>
              <p className={`col-span-4 text-sm font-semibold ${top ? 'text-tl-teal' : 'text-slate-900'}`}>{criteria}</p>
              <p className="col-span-6 text-slate-500 text-sm leading-relaxed">{desc}</p>
              <p className={`col-span-2 text-right text-sm font-bold ${top ? 'text-tl-teal' : 'text-slate-700'}`}>{weight}</p>
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
