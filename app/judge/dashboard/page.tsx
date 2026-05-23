'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Gavel, LogOut, Loader2, CheckCircle2, Clock, ExternalLink, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface Submission {
  id: string;
  teamName: string;
  gitRepoUrl: string;
  measuredResults: string;
  submittedAt: string;
  myScore: JudgeScore | null;
}

interface JudgeScore {
  businessValue: number;
  solutionEffectiveness: number;
  productionEvidence: number;
  problemClarity: number;
  aiIntegration: number;
  totalScore: number;
  notes: string | null;
  scoredAt: string;
}

const CRITERIA = [
  { key: 'businessValue',         label: 'Business Value',               weight: '30%', desc: 'Clear link to revenue growth or volume reduction' },
  { key: 'solutionEffectiveness', label: 'Solution Effectiveness',       weight: '20%', desc: 'Directly addresses problem; accurate, useful outputs' },
  { key: 'productionEvidence',    label: 'Production Evidence',          weight: '20%', desc: 'Deployed on real cases; shows when, where, how many' },
  { key: 'problemClarity',        label: 'Problem Clarity',              weight: '15%', desc: 'Business problem clearly defined and well-understood' },
  { key: 'aiIntegration',         label: 'AI Integration & Reusability', weight: '15%', desc: 'Claude meaningfully embedded; adoptable by other engineers' },
] as const;

type CriteriaKey = typeof CRITERIA[number]['key'];

function ScoreSlider({ label, weight, desc, value, onChange }: {
  label: string; weight: string; desc: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-slate-900 text-sm font-medium">{label}</span>
          <span className="ml-2 text-xs text-slate-400 font-mono">{weight}</span>
        </div>
        <span className={`text-lg font-bold w-8 text-right ${value >= 8 ? 'text-emerald-600' : value >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
          {value}
        </span>
      </div>
      <p className="text-slate-400 text-xs">{desc}</p>
      <input
        type="range" min={1} max={10} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-red-600"
      />
      <div className="flex justify-between text-xs text-slate-300">
        <span>1 — Poor</span>
        <span>5 — Adequate</span>
        <span>10 — Excellent</span>
      </div>
    </div>
  );
}

function SubmissionCard({ sub, judgeId, onScored }: { sub: Submission; judgeId: string; onScored: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [scores, setScores] = useState<Record<CriteriaKey, number>>({
    businessValue:         sub.myScore?.businessValue         ?? 5,
    solutionEffectiveness: sub.myScore?.solutionEffectiveness ?? 5,
    productionEvidence:    sub.myScore?.productionEvidence    ?? 5,
    problemClarity:        sub.myScore?.problemClarity        ?? 5,
    aiIntegration:         sub.myScore?.aiIntegration         ?? 5,
  });
  const [notes, setNotes] = useState(sub.myScore?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const weighted = Math.round(
    (scores.businessValue * 0.30 + scores.solutionEffectiveness * 0.20 +
     scores.productionEvidence * 0.20 + scores.problemClarity * 0.15 +
     scores.aiIntegration * 0.15) * 10
  ) / 10;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch('/api/judge/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId: sub.id, ...scores, notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onScored();
  };

  const scored = !!sub.myScore;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${scored ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            {scored ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-semibold text-sm truncate">{sub.teamName}</p>
            <p className="text-slate-400 text-xs">{scored ? `Scored: ${sub.myScore!.totalScore}/10` : 'Not yet scored'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <a href={sub.gitRepoUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-medium transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Repo
          </a>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Scoring Panel */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5 space-y-6">
          {/* Measured results */}
          {sub.measuredResults && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Team's Measured Results</p>
              <p className="text-slate-700 text-sm whitespace-pre-wrap">{sub.measuredResults}</p>
            </div>
          )}

          {/* Sliders */}
          <div className="space-y-5">
            {CRITERIA.map(c => (
              <ScoreSlider
                key={c.key}
                label={c.label}
                weight={c.weight}
                desc={c.desc}
                value={scores[c.key]}
                onChange={v => setScores(s => ({ ...s, [c.key]: v }))}
              />
            ))}
          </div>

          {/* Weighted total preview */}
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-5 py-3">
            <span className="text-slate-600 text-sm font-medium flex items-center gap-1.5">
              <Star className="w-4 h-4 text-red-500" /> Weighted Score
            </span>
            <span className="text-2xl font-black text-red-600">{weighted}<span className="text-sm font-medium text-slate-400">/10</span></span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-600 text-sm mb-1.5">Notes <span className="text-slate-400">(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any observations for the judging panel…"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> :
             saved  ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> :
             'Save Score'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function JudgeDashboard() {
  const router = useRouter();
  const [judgeId, setJudgeId] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    const res = await fetch('/api/judge/submissions');
    if (res.status === 401) { router.push('/judge'); return; }
    const data = await res.json();
    setSubmissions(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Get judge identity from cookie via a lightweight endpoint
    fetch('/api/judge/scores?submissionId=__ping').then(r => {
      if (r.status === 401) router.push('/judge');
    });
    fetchSubmissions();
    // Extract Siebel ID hint from URL or just show placeholder
    const stored = document.cookie.match(/judge_siebel=([^;]+)/)?.[1];
    if (stored) setJudgeId(decodeURIComponent(stored));
  }, [fetchSubmissions, router]);

  const handleLogout = async () => {
    await fetch('/api/judge/login', { method: 'DELETE' });
    router.push('/judge');
  };

  const scored  = submissions.filter(s => s.myScore).length;
  const total   = submissions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Nav */}
      <nav className="border-b border-red-100 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <Gavel className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm leading-tight">Judge&apos;s Corner</p>
              <p className="text-slate-400 text-xs leading-tight">Go AI-Native Hackathon</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-xs hidden sm:inline">{scored}/{total} scored</span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Project Submissions</h1>
          <p className="text-slate-500 text-sm">
            Score each submitted project against the rubric. Each criterion is rated 1–10; scores are weighted automatically.
          </p>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-sm font-medium">Your progress</span>
              <span className="text-slate-900 font-bold text-sm">{scored} / {total}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all"
                style={{ width: `${total ? (scored / total) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading submissions…</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Gavel className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No submitted projects yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(s => (
              <SubmissionCard key={s.id} sub={s} judgeId={judgeId} onScored={fetchSubmissions} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
