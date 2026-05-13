'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { FileText, CheckCircle, AlertCircle, Loader2, GitBranch, BarChart2, Sparkles, Users, Zap, FlaskConical } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';
interface TeamOption { id: string; teamName: string; }

interface FormState {
  gitRepoUrl: string;
  problemStatement: string;
  solutionDescription: string;
  productionEvidence: string;
  measuredResults: string;
  impactMath: string;
  aiUsage: string;
  teamContributions: string;
}

const SECTIONS = [
  {
    key: 'gitRepoUrl' as keyof FormState,
    icon: GitBranch,
    label: 'Git Repository URL',
    hint: 'Link to your team\'s Git repo tagged v1.0. README must explain the problem, solution, and how to run it in 3 commands or fewer.',
    placeholder: 'https://github.com/your-org/your-repo',
    required: true,
    rows: 1,
    type: 'url',
  },
  {
    key: 'problemStatement' as keyof FormState,
    icon: FlaskConical,
    label: 'Problem Statement',
    hint: 'What production problem are you solving? Be specific — what volume, what case type, what pain point.',
    placeholder: 'Describe the specific production problem your tool addresses...',
    required: true,
    rows: 4,
  },
  {
    key: 'solutionDescription' as keyof FormState,
    icon: Zap,
    label: 'Solution Description',
    hint: 'How does your Claude-powered tool address the problem? What does it do and how does it work?',
    placeholder: 'Describe your tool — what it does, how Claude is used, and how it integrates into your workflow...',
    required: true,
    rows: 5,
  },
  {
    key: 'productionEvidence' as keyof FormState,
    icon: FileText,
    label: 'Production Deployment Evidence',
    hint: 'When was the tool deployed? Where (Phones / Chat / Email / Portal)? On how many cases? Authorized by which squad lead?',
    placeholder: 'e.g., Deployed June 15 on Zean squad chat queue. Ran on 240 cases over 5 days. Authorized by [Squad Lead Name].',
    required: false,
    rows: 4,
  },
  {
    key: 'measuredResults' as keyof FormState,
    icon: BarChart2,
    label: 'Measured Results',
    hint: 'Actual numbers from the production run — not projections. Tickets deflected, revenue generated or protected, cases auto-resolved.',
    placeholder: 'e.g., 87 tickets deflected out of 240 (36% deflection rate). Estimated 14 engineer-hours reclaimed per week.',
    required: true,
    rows: 4,
  },
  {
    key: 'impactMath' as keyof FormState,
    icon: BarChart2,
    label: 'Impact Math',
    hint: 'Show your work. Baseline → measured delta → calculation. Judges verify this — make it defensible.',
    placeholder: 'Baseline: avg 3.5 min to resolve this case type. Tool resolves in 40 sec. 87 cases × 3 min saved = 261 min = 4.35 hrs in 5 days...',
    required: true,
    rows: 5,
  },
  {
    key: 'aiUsage' as keyof FormState,
    icon: Sparkles,
    label: 'AI Usage (AI-USAGE.md)',
    hint: 'Where did you use Claude across your workflow? Building, brainstorming, writing, presenting. Manual exceptions should be named honestly.',
    placeholder: 'Used Claude to: brainstorm the problem framing, generate the initial skill scaffold, write the README, draft this submission. Manual: final code review done by team without AI.',
    required: true,
    rows: 5,
  },
  {
    key: 'teamContributions' as keyof FormState,
    icon: Users,
    label: 'Team Contributions (CONTRIBUTORS.md)',
    hint: 'One line per member describing what they built. This is public in the repo — be specific.',
    placeholder: 'Ana Cruz – Built the Claude skill and prompt chain\nJuan Reyes – Integrated with the ticketing system via MCP\nMaria Santos – Designed the production test plan and captured results\nJose Bautista – Wrote documentation and the impact math',
    required: false,
    rows: 5,
  },
];

function SubmitForm() {
  const searchParams = useSearchParams();
  const [teamId, setTeamId] = useState(searchParams.get('teamId') || '');
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [form, setForm] = useState<FormState>({
    gitRepoUrl: '',
    problemStatement: '',
    solutionDescription: '',
    productionEvidence: '',
    measuredResults: '',
    impactMath: '',
    aiUsage: '',
    teamContributions: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');

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
            <p className="text-red-300 text-xs uppercase tracking-widest mb-1">Submission ID</p>
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
          Every team&apos;s submission must include a Git repo tagged <code className="text-rose-300 bg-white px-1 rounded">v1.0</code>, production deployment evidence, and actual measured results — not projections.
        </p>
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

        {/* Submission fields */}
        {SECTIONS.map(({ key, icon: Icon, label, hint, placeholder, required, rows, type }) => (
          <div key={key} className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-2 mb-3">
              <Icon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <label className="block text-slate-900 font-semibold text-sm">
                  {label} {required && <span className="text-red-400">*</span>}
                  {!required && <span className="text-slate-400 text-xs font-normal ml-1">(optional)</span>}
                </label>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{hint}</p>
              </div>
            </div>
            {rows === 1 ? (
              <input
                type={type || 'text'}
                required={required}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors font-mono text-sm"
              />
            ) : (
              <textarea
                required={required}
                rows={rows}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed text-sm"
              />
            )}
          </div>
        ))}

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
