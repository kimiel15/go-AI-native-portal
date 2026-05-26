'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/components/NavBar';
import {
  FileText, CheckCircle, AlertCircle, Loader2, GitBranch,
  BarChart2, BookOpen, ChevronDown, Save, Lock, AlertTriangle,
  ExternalLink, TrendingUp, Shield,
} from 'lucide-react';

type Status = 'idle' | 'saving' | 'submitting' | 'saved' | 'submitted' | 'error';
interface TeamOption { id: string; teamName: string; }
interface ExistingSubmission {
  id: string;
  gitRepoUrl: string;
  measuredResults: string;
  status: 'draft' | 'submitted';
  submittedAt: string;
}

// ── Confirmation dialog ────────────────────────────────────────────────────
function ConfirmSubmitDialog({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-10">
        <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
          Submit for Review?
        </h2>
        <p className="text-slate-500 text-sm text-center leading-relaxed mb-1">
          Once submitted, <strong className="text-slate-700">your project cannot be edited</strong>.
          Judges will score it based on what you submit now.
        </p>
        <p className="text-slate-400 text-xs text-center mb-8">
          Make sure your Git repo README is complete before continuing.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-slate-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-tl-red hover:bg-tl-burgundy text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><Lock className="w-4 h-4" /> Yes, Submit</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Locked / submitted view ────────────────────────────────────────────────
function SubmittedView({ sub }: { sub: ExistingSubmission }) {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-10">
        <div className="w-16 h-16 rounded-full bg-tl-teal-light/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-tl-teal" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Submitted</h2>
        <p className="text-slate-500 text-sm mb-1">Your submission is locked and under review.</p>
        <p className="text-slate-400 text-xs mb-8">
          Submitted {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="text-left space-y-4 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Git Repository</p>
            <a
              href={sub.gitRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-tl-red hover:text-tl-burgundy text-sm font-medium break-all transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 flex-shrink-0" />
              {sub.gitRepoUrl}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Headline Result</p>
            <p className="text-slate-700 text-sm leading-relaxed">{sub.measuredResults}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href="/submissions"
            className="flex-1 block text-center bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            View All Submissions
          </a>
          <a
            href="/"
            className="flex-1 block text-center bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────
function SubmitForm() {
  const searchParams = useSearchParams();
  const [teamId, setTeamId] = useState(searchParams.get('teamId') || '');
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [measuredResults, setMeasuredResults] = useState('');
  const [businessValue, setBusinessValue] = useState<'revenue-growth' | 'ai-containment' | ''>('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [existing, setExisting] = useState<ExistingSubmission | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Load teams
  useEffect(() => {
    fetch('/api/register').then(r => r.json()).then(setTeams).catch(() => {});
  }, []);

  // Load existing submission when team is selected
  useEffect(() => {
    if (!teamId) { setExisting(null); setGitRepoUrl(''); setMeasuredResults(''); setBusinessValue(''); return; }
    setLoadingExisting(true);
    fetch(`/api/submit?teamId=${teamId}`)
      .then(r => r.json())
      .then((data: ExistingSubmission | null) => {
        setExisting(data);
        if (data) {
          setGitRepoUrl(data.gitRepoUrl);
          setMeasuredResults(data.measuredResults);
          setBusinessValue((data as ExistingSubmission & { businessValue?: string }).businessValue as 'revenue-growth' | 'ai-containment' | '' ?? '');
        } else {
          setGitRepoUrl('');
          setMeasuredResults('');
          setBusinessValue('');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [teamId]);

  // If team already has a submitted (locked) submission, show locked view
  if (existing?.status === 'submitted') {
    return <SubmittedView sub={existing} />;
  }

  const handleSave = async () => {
    if (!teamId || !gitRepoUrl || !measuredResults) return;
    setStatus('saving');
    setSavedMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, gitRepoUrl, measuredResults, businessValue: businessValue || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setStatus('saved');
      setSavedMsg('Draft saved — you can continue editing and submit when ready.');
      // Refresh existing so the form knows an id exists
      const updated = await fetch(`/api/submit?teamId=${teamId}`).then(r => r.json());
      setExisting(updated);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const handleFinalSubmit = async () => {
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/submit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, gitRepoUrl, measuredResults, businessValue: businessValue || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      setStatus('submitted');
      // Refresh to show locked view
      const updated = await fetch(`/api/submit?teamId=${teamId}`).then(r => r.json());
      setExisting(updated);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setShowConfirm(false);
    }
  };

  const isWorking = status === 'saving' || status === 'submitting';
  const canSubmit = !!teamId && !!gitRepoUrl && !!measuredResults;

  return (
    <>
      {showConfirm && (
        <ConfirmSubmitDialog
          onConfirm={handleFinalSubmit}
          onCancel={() => { setShowConfirm(false); setStatus('idle'); }}
          loading={status === 'submitting'}
        />
      )}

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tl-red to-tl-burgundy flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-tl-red text-xs uppercase tracking-widest">Step 02</p>
              <h1 className="text-2xl font-bold text-slate-900">Project Submission</h1>
            </div>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Save your draft anytime. When you&apos;re ready, <strong className="text-slate-700">Submit for Review</strong> — the submission will be locked and sent to judges.
          </p>

          {existing?.status === 'draft' && (
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-amber-700 text-xs font-medium">Draft saved · not yet submitted</span>
            </div>
          )}
        </div>

        {/* README Guide */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
          <button
            type="button"
            onClick={() => setShowGuide(g => !g)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-tl-red flex-shrink-0" />
              <span className="text-slate-900 font-semibold text-sm">README.md Structure Guide</span>
              <span className="text-slate-400 text-xs hidden sm:inline">— what judges look for</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${showGuide ? 'rotate-180' : ''}`} />
          </button>
          {showGuide && (
            <div className="border-t border-gray-100 px-6 py-5">
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                Your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-rose-600 text-xs">[tool-name].md</code> in your Git repo is your full submission — judges score it against this structure.
              </p>
              <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-slate-700 overflow-x-auto leading-relaxed font-mono whitespace-pre">{`# [tool-name].md

> One-line: what it does and who it helps

## Problem Statement
What is the business problem? Include data or evidence that the problem is real
(e.g. volume, handle time, error rate, customer impact).

## Solution
How does your Claude-powered tool solve it?
Describe what it does, how it works, and who uses it.

## Production Evidence & Results
Pilot dates: [Jun 15 – 21]
Cases handled: [number]
Deployed in: [queue / tool / environment]

| Metric      | Before | After | Delta |
|-------------|--------|-------|-------|
| Handle time | X min  | Y min | -Z%   |

Impact math:
Baseline: [X cases/day × Y min = Z hrs]
Delta: [reduction × cost = $value saved]

## Contribution
What did each team member do?
- [Name] — [what they built / owned]
- [Name] — [what they built / owned]

## Claude Usage
How was Claude meaningfully used to build this tool?
What prompts, workflows, or integrations were key?

## Usage Instructions
Step-by-step guide to run the tool:
\`\`\`bash
command 1
command 2
command 3
\`\`\``}</pre>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Team selector */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <label className="block text-slate-600 text-sm mb-1.5">
              Team <span className="text-red-400">*</span>
            </label>
            {loadingExisting ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : (
              <select
                required
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-tl-teal transition-colors"
              >
                <option value="">-- Select your registered team --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
              </select>
            )}
            <p className="text-slate-400 text-xs mt-2">
              Not registered yet?{' '}
              <a href="/register" className="text-red-400 hover:underline">Register your team first</a>.
            </p>
          </div>

          {/* Business Value Category */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-tl-red flex-shrink-0 mt-0.5" />
              <div>
                <label className="block text-slate-900 font-semibold text-sm">
                  Business Value Category <span className="text-red-400">*</span>
                </label>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Choose the primary value your solution delivers to the business.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Revenue Growth */}
              <button
                type="button"
                onClick={() => setBusinessValue('revenue-growth')}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  businessValue === 'revenue-growth'
                    ? 'border-tl-teal bg-tl-teal-light/15'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${businessValue === 'revenue-growth' ? 'bg-tl-teal text-white' : 'bg-gray-100 text-slate-500'}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-semibold ${businessValue === 'revenue-growth' ? 'text-tl-teal' : 'text-slate-700'}`}>
                    Revenue Growth
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Your tool directly contributes to generating more revenue — e.g. faster case resolution, upsell enablement, or improved customer retention.
                </p>
              </button>

              {/* AI Containment */}
              <button
                type="button"
                onClick={() => setBusinessValue('ai-containment')}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  businessValue === 'ai-containment'
                    ? 'border-tl-teal bg-tl-teal-light/15'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${businessValue === 'ai-containment' ? 'bg-tl-teal text-white' : 'bg-gray-100 text-slate-500'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-semibold ${businessValue === 'ai-containment' ? 'text-tl-teal' : 'text-slate-700'}`}>
                    AI Containment
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Your tool reduces support volume or operational cost — e.g. ticket deflection, automation of repetitive tasks, or reduced handle time.
                </p>
              </button>
            </div>
          </div>

          {/* Git Repo URL */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-tl-red flex-shrink-0 mt-0.5" />
              <div>
                <label className="block text-slate-900 font-semibold text-sm">
                  Git Repository URL <span className="text-red-400">*</span>
                </label>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Link to your repo tagged <code className="bg-gray-100 px-1 rounded text-rose-600">v1.0</code>. README must cover problem, solution, production evidence, results, and impact math.
                </p>
              </div>
            </div>
            <input
              type="url"
              required
              value={gitRepoUrl}
              onChange={e => setGitRepoUrl(e.target.value)}
              placeholder="https://github.com/your-org/your-repo"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-tl-teal transition-colors font-mono text-sm"
            />
          </div>

          {/* Headline Result */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-tl-red flex-shrink-0 mt-0.5" />
              <div>
                <label className="block text-slate-900 font-semibold text-sm">
                  Headline Result <span className="text-red-400">*</span>
                </label>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  One or two sentences — actual numbers only, no projections. Judges compare teams at a glance using this.
                </p>
              </div>
            </div>
            <textarea
              required
              rows={3}
              value={measuredResults}
              onChange={e => setMeasuredResults(e.target.value)}
              placeholder="e.g., 87 tickets deflected out of 240 (36% deflection rate) over 5 days — saving ~14 engineer-hours per week."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-tl-teal transition-colors resize-none leading-relaxed text-sm"
            />
          </div>

          {/* Feedback banners */}
          {status === 'saved' && (
            <div className="flex items-start gap-3 bg-tl-teal-light/20 border border-tl-teal-light rounded-xl px-4 py-3">
              <CheckCircle className="w-5 h-5 text-tl-teal flex-shrink-0 mt-0.5" />
              <p className="text-tl-teal text-sm">{savedMsg}</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {/* Save draft */}
            <button
              type="button"
              disabled={!canSubmit || isWorking}
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-semibold py-3.5 rounded-xl transition-all"
            >
              {status === 'saving' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Draft</>
              )}
            </button>

            {/* Submit for review */}
            <button
              type="button"
              disabled={!canSubmit || isWorking}
              onClick={() => { setSavedMsg(''); setErrorMsg(''); setShowConfirm(true); }}
              className="flex-1 flex items-center justify-center gap-2 bg-tl-red hover:bg-tl-burgundy disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-rose-500/20"
            >
              <Lock className="w-4 h-4" /> Submit for Review
            </button>
          </div>

          <p className="text-center text-slate-400 text-xs">
            Submission deadline: <strong className="text-slate-500">EOD June 21, 2026</strong>
          </p>
        </div>
      </div>
    </>
  );
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen tl-page-bg">
      <NavBar />
      <Suspense fallback={<div className="text-slate-500 text-center py-20">Loading...</div>}>
        <SubmitForm />
      </Suspense>
    </div>
  );
}
