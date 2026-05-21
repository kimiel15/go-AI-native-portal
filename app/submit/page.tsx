'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { FileText, CheckCircle, AlertCircle, Loader2, GitBranch, BarChart2, BookOpen, ChevronDown } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';
interface TeamOption { id: string; teamName: string; }

interface FormState {
  gitRepoUrl: string;
  measuredResults: string;
}

function SubmitForm() {
  const searchParams = useSearchParams();
  const [teamId, setTeamId] = useState(searchParams.get('teamId') || '');
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [form, setForm] = useState<FormState>({
    gitRepoUrl: '',
    measuredResults: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetch('/api/register').then(r => r.json()).then(setTeams).catch(() => {});
  }, []);

  const set = (field: keyof FormState, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      setSubmissionId(data.submissionId);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Project Submitted!</h2>
          <p className="text-slate-500 mb-2">Your team&apos;s submission has been recorded.</p>
          <p className="text-slate-400 text-xs mb-6">Your squad lead will attest to the results at final submission.</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <p className="text-red-600 text-xs uppercase tracking-widest mb-1">Submission ID</p>
            <p className="text-slate-900 font-mono text-sm break-all">{submissionId}</p>
          </div>
          <a href="/" className="block bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold py-3 rounded-xl transition-all">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-rose-400 text-xs uppercase tracking-widest">Step 03</p>
            <h1 className="text-2xl font-bold text-slate-900">Project Submission</h1>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          Submit your Git repo link and headline result. Everything else — problem, solution, evidence, impact math, contributors — lives in your <code className="text-rose-600 bg-red-50 px-1 rounded">README.md</code>.
        </p>
      </div>

      {/* README Guide */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
        <button
          type="button"
          onClick={() => setShowGuide(g => !g)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="text-slate-900 font-semibold text-sm">README.md Structure Guide</span>
            <span className="text-slate-400 text-xs hidden sm:inline">— what judges look for</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${showGuide ? 'rotate-180' : ''}`} />
        </button>
        {showGuide && (
          <div className="border-t border-gray-100 px-6 py-5">
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              Your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-rose-600 text-xs">[tool-name].md</code> is your full submission — judges score it against the rubric. Each section maps to a judging criterion. Keep a separate <code className="bg-gray-100 px-1.5 py-0.5 rounded text-rose-600 text-xs">CONTRIBUTORS.md</code> for team contributions.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Problem Clarity',           weight: '25%', color: 'bg-red-50 border-red-200 text-red-700' },
                { label: 'Business Value',             weight: '30%', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                { label: 'Solution Effectiveness',     weight: '20%', color: 'bg-rose-50 border-rose-200 text-rose-700' },
                { label: 'AI Integration & Reusability', weight: '15%', color: 'bg-orange-50 border-orange-200 text-orange-700' },
              ].map(({ label, weight, color }) => (
                <div key={label} className={`border rounded-lg px-3 py-2 ${color}`}>
                  <span className="font-bold text-xs">{weight}</span>
                  <span className="text-xs ml-1">{label}</span>
                </div>
              ))}
              <div className="col-span-2 border rounded-lg px-3 py-2 bg-slate-50 border-slate-200 text-slate-600">
                <span className="font-bold text-xs">10%</span>
                <span className="text-xs ml-1">Production Evidence — when, where, how many cases, authorized by whom</span>
              </div>
            </div>
            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-slate-700 overflow-x-auto leading-relaxed font-mono whitespace-pre">{`# [tool-name].md

> One-line: what it does and who it helps

## How to run
\`\`\`bash
command 1
command 2
command 3
\`\`\`

## Problem
What business problem are you solving?
Be specific — what queue, case type, or pain point.

## Solution
How does your Claude-powered tool address it?
What does it do, how does it work, what does it output?

## Business value
Link to revenue growth, retention, or operational efficiency.

Pilot dates: [Jun 15 – 21]
Cases handled: [number]
Deployed in: [queue / tool / environment]

| Metric      | Before | After | Delta |
|-------------|--------|-------|-------|
| Handle time | X min  | Y min | -Z%   |

Impact math:
Baseline: [X cases/day × Y min = Z hrs]
Delta: [reduction × cost = $value saved]

## Claude integration
How is Claude meaningfully embedded as a core enabler?
Can another engineer pick this up and reuse it? How?`}</pre>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-amber-700 text-xs font-semibold mb-1">CONTRIBUTORS.md — keep this separate</p>
              <p className="text-slate-500 text-xs leading-relaxed">One line per member. Example:<br />
                <span className="font-mono">Ana Cruz – Built the Claude skill and prompt chain</span><br />
                <span className="font-mono">Juan Reyes – Integrated with the ticketing system via MCP</span>
              </p>
            </div>
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-slate-700 text-xs font-semibold mb-1">README filename format</p>
              <p className="text-slate-500 text-xs leading-relaxed mb-2">Name your README file after your tool — lowercase, hyphens only:</p>
              <code className="block bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-rose-600 font-mono mb-2">[tool-name].md</code>
              <p className="text-slate-400 text-xs">Examples:<br />
                <span className="font-mono text-slate-500">ticket-triage.md</span><br />
                <span className="font-mono text-slate-500">email-classifier.md</span><br />
                <span className="font-mono text-slate-500">case-summariser.md</span>
              </p>
            </div>
            <p className="text-slate-400 text-xs mt-3">
              💡 The hardest part is <strong className="text-slate-500">Results</strong> and <strong className="text-slate-500">Impact Math</strong> — start capturing numbers from day one of your production run (Jun 15).
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Team selector */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <label className="block text-slate-600 text-sm mb-1.5">
            Team <span className="text-red-400">*</span>
          </label>
          <select required value={teamId} onChange={e => setTeamId(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-rose-500 transition-colors">
            <option value="" className="bg-white">-- Select your registered team --</option>
            {teams.map(t => <option key={t.id} value={t.id} className="bg-white">{t.teamName}</option>)}
          </select>
          <p className="text-slate-400 text-xs mt-2">
            Not registered yet?{' '}
            <a href="/register" className="text-red-400 hover:underline">Register your team first</a>.
          </p>
        </div>

        {/* Git Repo URL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <label className="block text-slate-900 font-semibold text-sm">
                Git Repository URL <span className="text-red-400">*</span>
              </label>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                Link to your repo tagged <code className="bg-gray-100 px-1 rounded text-rose-600">v1.0</code>. Your README.md is the full submission — it must cover problem, solution, production evidence, results, impact math, how Claude was used, and how to run in 3 commands or fewer.
              </p>
            </div>
          </div>
          <input
            type="url"
            required
            value={form.gitRepoUrl}
            onChange={e => set('gitRepoUrl', e.target.value)}
            placeholder="https://github.com/your-org/your-repo"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"
          />
        </div>

        {/* Measured Results — headline for judge dashboard */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <label className="block text-slate-900 font-semibold text-sm">
                Headline Result <span className="text-red-400">*</span>
              </label>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                One or two sentences — actual numbers only, no projections. Judges use this to compare teams at a glance without opening GitHub. Full detail lives in your README.
              </p>
            </div>
          </div>
          <textarea
            required
            rows={3}
            value={form.measuredResults}
            onChange={e => set('measuredResults', e.target.value)}
            placeholder="e.g., 87 tickets deflected out of 240 (36% deflection rate) over 5 days — saving ~14 engineer-hours per week."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed text-sm"
          />
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{message}</p>
          </div>
        )}

        <button type="submit" disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all">
          {status === 'loading'
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            : <><CheckCircle className="w-4 h-4" /> Submit Project</>}
        </button>
        <p className="text-center text-slate-400 text-xs">
          Submission deadline: <strong className="text-slate-500">EOD June 21, 2026</strong>. Squad lead attestation required at submission.
        </p>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <NavBar />
      <Suspense fallback={<div className="text-slate-500 text-center py-20">Loading...</div>}>
        <SubmitForm />
      </Suspense>
    </div>
  );
}
