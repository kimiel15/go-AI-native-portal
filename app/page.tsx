import Link from 'next/link';
import { Users, FileText, Brain, LayoutDashboard, ArrowRight, Zap, Calendar, Target, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Brain,
    title: 'AI Proficiency Assessment',
    description: 'Each team member completes a short assessment to gauge their AI knowledge level. Done individually before forming your team.',
    href: '/assessment',
    color: 'from-orange-500 to-red-600',
    cta: 'Take Assessment',
  },
  {
    step: '02',
    icon: Users,
    title: 'Register Your Team',
    description: 'Form a team of 3–4 engineers within or across squads and register your entry. Mandatory for all teams.',
    href: '/register',
    color: 'from-red-500 to-rose-600',
    cta: 'Register Team',
  },
  {
    step: '03',
    icon: FileText,
    title: 'Submit Your Project',
    description: 'Submit your Claude-powered tool with Git repo, production deployment evidence, and measured results.',
    href: '/submit',
    color: 'from-rose-500 to-pink-600',
    cta: 'Submit Project',
  },
];

const awards = [
  { label: 'Volume Reduction Winner', desc: 'Largest measured deflection from production', icon: TrendingUp, color: 'text-emerald-600' },
  { label: 'Revenue Generation Winner', desc: 'Largest measured revenue or revenue protection', icon: Target, color: 'text-amber-600' },
  { label: 'Most Ingenious Build', desc: 'Most creative or unexpected use of Claude', icon: Zap, color: 'text-rose-400' },
  { label: "People's Choice", desc: 'Live audience vote on June 27', icon: Users, color: 'text-orange-400' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Nav */}
      <nav className="border-b border-red-100 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">Go AI-Native</span>
          </div>
          <Link href="/admin" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <LayoutDashboard className="w-4 h-4" />Admin
          </Link>
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

        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-10">
          <Calendar className="w-4 h-4 text-red-400" />
          <span className="text-slate-500 text-sm">Main Event · <strong className="text-red-600">Saturday, June 27, 2026</strong></span>
        </div>

        <p className="text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Every team in RoW Support builds a Claude-powered tool, runs it on real production cases,
          and proves measurable impact. 15 squads · 92 engineers · ~25 teams · 4 awards.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/assessment"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/admin"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold px-8 py-3.5 rounded-xl transition-all border border-gray-200">
            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
          Three Steps to Submit
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map(({ step, icon: Icon, title, description, href, color, cta }) => (
            <Link key={step} href={href} className="group block card-hover">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:border-gray-300 transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-black text-slate-200 group-hover:text-slate-300 transition-colors">{step}</span>
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold group-hover:gap-3 transition-all">
                  {cta} <ArrowRight className="w-4 h-4" />
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

      {/* Awards */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-10">
          Four Awards
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {awards.map(({ label, desc, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5">
              <Icon className={`w-6 h-6 mb-3 ${color}`} />
              <p className="text-slate-900 font-semibold text-sm mb-1">{label}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
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
