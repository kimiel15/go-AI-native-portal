'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gavel, LogOut, Loader2, Trophy, Medal, ExternalLink,
  ChevronDown, ChevronUp, Users, AlertCircle, MessageSquare,
  LayoutList, Table2, X,
} from 'lucide-react';

interface JudgeScoreDetail {
  judgeId: string;
  totalScore: number;
  businessValue: number;
  solutionEffectiveness: number;
  productionEvidence: number;
  problemClarity: number;
  aiIntegration: number;
  notes: string | null;
  scoredAt: string;
}

interface RankedSubmission {
  id: string;
  teamName: string;
  gitRepoUrl: string;
  measuredResults: string;
  submittedAt: string;
  judgeCount: number;
  avgTotal: number;
  avgBusinessValue: number;
  avgSolutionEffectiveness: number;
  avgProductionEvidence: number;
  avgProblemClarity: number;
  avgAiIntegration: number;
  scores: JudgeScoreDetail[];
}

interface RankingsData {
  judges: string[];
  rankings: RankedSubmission[];
}

const CRITERIA = [
  { key: 'avgBusinessValue',         label: 'Business Value',         max: 30 },
  { key: 'avgSolutionEffectiveness', label: 'Solution Effectiveness', max: 20 },
  { key: 'avgProductionEvidence',    label: 'Production Evidence',    max: 20 },
  { key: 'avgProblemClarity',        label: 'Problem Clarity',        max: 15 },
  { key: 'avgAiIntegration',         label: 'AI Integration',         max: 15 },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JUDGE_NAMES: Record<string, string> = {
  ribenitor:  'Bennett',
  karens:     'Karen',
  jezriela:   'Jez',
  michaell:   'Mickey',
  descartesc: 'Descartes',
};

function judgeName(id: string) {
  return JUDGE_NAMES[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

function scoreColor(score: number) {
  return score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-500' : 'text-red-500';
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color =
    pct >= 80 ? 'from-emerald-500 to-emerald-400' :
    pct >= 60 ? 'from-amber-500 to-amber-400' :
    pct >= 40 ? 'from-orange-500 to-orange-400' :
                'from-red-500 to-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-500 w-8 text-right">{value}%</span>
    </div>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0"><Trophy className="w-4 h-4 text-white" /></div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0"><Medal className="w-4 h-4 text-white" /></div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0"><Medal className="w-4 h-4 text-white" /></div>;
  return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"><span className="text-slate-500 text-sm font-bold">{rank}</span></div>;
}

// ─── Notes Modal ──────────────────────────────────────────────────────────────

function NotesModal({ sub, onClose }: { sub: RankedSubmission; onClose: () => void }) {
  const withNotes  = sub.scores.filter(s => s.notes);
  const noNotes    = sub.scores.filter(s => !s.notes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <p className="text-slate-900 font-bold">{sub.teamName}</p>
            <p className="text-slate-400 text-xs">Judges&apos; Comments</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {sub.scores.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No judges have scored this submission yet.</p>
          ) : (
            <>
              {withNotes.map(s => (
                <div key={s.judgeId} className="space-y-1.5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{judgeName(s.judgeId)}</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <p className="text-slate-700 text-sm leading-relaxed">&ldquo;{s.notes}&rdquo;</p>
                  </div>
                </div>
              ))}
              {noNotes.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-slate-300 text-xs font-semibold uppercase tracking-widest">No comment left by</p>
                  <p className="text-slate-400 text-sm">{noNotes.map(s => judgeName(s.judgeId)).join(', ')}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ranked Card (list view) ──────────────────────────────────────────────────

function RankedCard({ sub, rank, onNotesClick }: {
  sub: RankedSubmission;
  rank: number;
  onNotesClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isUnscored = sub.judgeCount === 0;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden ${
      rank === 1 ? 'border-amber-200 shadow-amber-100 shadow-sm' :
      rank === 2 ? 'border-slate-200' :
      rank === 3 ? 'border-orange-200' : 'border-gray-200'
    }`}>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <RankBadge rank={rank} />
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 font-semibold text-sm truncate">{sub.teamName}</p>
          {isUnscored
            ? <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5"><AlertCircle className="w-3 h-3" /> No scores yet</p>
            : <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1"><Users className="w-3 h-3" />{sub.judgeCount} judge{sub.judgeCount !== 1 ? 's' : ''}</p>
          }
        </div>
        <div className="flex-shrink-0 text-right">
          {isUnscored
            ? <span className="text-slate-300 text-sm font-medium">—</span>
            : <><span className={`text-2xl font-black ${scoreColor(sub.avgTotal)}`}>{sub.avgTotal}</span><span className="text-slate-400 text-sm font-medium">%</span></>
          }
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {sub.scores.some(s => s.notes) && (
            <button
              onClick={e => { e.stopPropagation(); onNotesClick(); }}
              className="p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="View judges' comments"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
          <a href={sub.gitRepoUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-red-400 hover:text-red-600 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-5">
          {!isUnscored && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs uppercase tracking-widest">Criterion Averages</p>
              {CRITERIA.map(c => (
                <div key={c.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 text-xs font-medium">{c.label}</span>
                    <span className="text-slate-400 text-xs font-mono">{sub[c.key] as number} / {c.max}%</span>
                  </div>
                  <ScoreBar value={sub[c.key] as number} max={c.max} />
                </div>
              ))}
            </div>
          )}
          {sub.scores.length > 0 && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs uppercase tracking-widest">Individual Judge Scores</p>
              <div className="space-y-2">
                {sub.scores.map(s => (
                  <div key={s.judgeId} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-xs font-mono font-semibold">{s.judgeId}</span>
                      <span className={`text-sm font-bold ${scoreColor(s.totalScore)}`}>{s.totalScore}%</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {[
                        { label: 'BV', value: s.businessValue },
                        { label: 'SE', value: s.solutionEffectiveness },
                        { label: 'PE', value: s.productionEvidence },
                        { label: 'PC', value: s.problemClarity },
                        { label: 'AI', value: s.aiIntegration },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-lg p-1.5">
                          <p className="text-slate-900 text-xs font-bold">{value}</p>
                          <p className="text-slate-400 text-[10px]">{label}</p>
                        </div>
                      ))}
                    </div>
                    {s.notes && <p className="text-slate-500 text-xs italic border-t border-gray-200 pt-2">&ldquo;{s.notes}&rdquo;</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {sub.measuredResults && (
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Team&rsquo;s Measured Results</p>
              <p className="text-slate-700 text-sm whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-xl p-4">{sub.measuredResults}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Score Table (matrix view) ────────────────────────────────────────────────

function ScoreTable({ rankings, judges, onNotesClick }: {
  rankings: RankedSubmission[];
  judges: string[];
  onNotesClick: (sub: RankedSubmission) => void;
}) {
  if (rankings.length === 0) return (
    <div className="text-center py-20 text-slate-400">
      <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="text-sm">No submitted projects yet.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {/* Team column */}
            <th className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide min-w-[220px]">
              Team
            </th>
            {/* One column per judge */}
            {judges.map(j => (
              <th key={j} className="text-center px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide min-w-[90px]">
                {judgeName(j)}
              </th>
            ))}
            {/* Average */}
            <th className="text-center px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide min-w-[80px]">
              Avg
            </th>
            {/* Notes */}
            <th className="text-center px-4 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide w-12">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((sub, i) => {
            const scoreMap = Object.fromEntries(sub.scores.map(s => [s.judgeId, s]));
            const hasAnyNote = sub.scores.some(s => s.notes);

            return (
              <tr key={sub.id} className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-red-50/30 transition-colors`}>

                {/* Team cell */}
                <td className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    {/* Rank number */}
                    <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-slate-300 text-white' :
                      i === 2 ? 'bg-orange-400 text-white' :
                                'bg-gray-100 text-slate-500'
                    }`}>{i + 1}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-semibold text-sm truncate">{sub.teamName}</span>
                        <a
                          href={sub.gitRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                          title="Open Git repo"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {sub.measuredResults && (
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                          {sub.measuredResults}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Per-judge score cells */}
                {judges.map(j => {
                  const s = scoreMap[j];
                  return (
                    <td key={j} className="px-4 py-3 text-center">
                      {s ? (
                        <span className={`text-base font-bold ${scoreColor(s.totalScore)}`}>
                          {s.totalScore}
                          <span className="text-xs font-normal text-slate-400">%</span>
                        </span>
                      ) : (
                        <span className="text-slate-200 text-lg font-bold">—</span>
                      )}
                    </td>
                  );
                })}

                {/* Average cell */}
                <td className="px-4 py-3 text-center">
                  {sub.judgeCount > 0 ? (
                    <span className={`text-base font-black ${scoreColor(sub.avgTotal)}`}>
                      {sub.avgTotal}
                      <span className="text-xs font-normal text-slate-400">%</span>
                    </span>
                  ) : (
                    <span className="text-slate-200 text-lg font-bold">—</span>
                  )}
                </td>

                {/* Notes button */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onNotesClick(sub)}
                    disabled={sub.scores.length === 0}
                    title={hasAnyNote ? "View judges' comments" : sub.scores.length === 0 ? 'Not yet scored' : 'No comments left'}
                    className={`mx-auto flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                      hasAnyNote
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : sub.scores.length > 0
                          ? 'text-slate-300 bg-gray-50 hover:bg-gray-100'
                          : 'text-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = 'list' | 'table';

export default function RankingsPage() {
  const router = useRouter();
  const [data, setData] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [notesTarget, setNotesTarget] = useState<RankedSubmission | null>(null);

  const fetchRankings = useCallback(async () => {
    const res = await fetch('/api/judge/rankings');
    if (res.status === 401) { router.push('/judge'); return; }
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  const handleLogout = async () => {
    await fetch('/api/judge/login', { method: 'DELETE' });
    router.push('/judge');
  };

  const rankings = data?.rankings ?? [];
  const judges   = data?.judges   ?? [];
  const scored   = rankings.filter(r => r.judgeCount > 0).length;
  const total    = rankings.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Nav */}
      <nav className="border-b border-red-100 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <Gavel className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm leading-tight">Judges&apos; Corner</p>
                <p className="text-slate-400 text-xs leading-tight">Go AI-Native Hackathon</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs">
              <button onClick={() => router.push('/judge/dashboard')}
                className="text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg transition-colors">
                Scoring
              </button>
              <span className="text-slate-200">/</span>
              <span className="text-red-600 font-semibold px-2 py-1">Rankings</span>
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

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header + view toggle */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Live Rankings</h1>
            <p className="text-slate-500 text-sm">
              {view === 'list'
                ? 'Ranked by average score across all judges. Expand a row for breakdowns.'
                : 'Score matrix — all judges side by side. Click the comment icon to read notes.'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex-shrink-0 flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />Ranked
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />Table
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading rankings…</p>
          </div>
        ) : view === 'list' ? (
          rankings.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No submitted projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((sub, i) => (
                <RankedCard key={sub.id} sub={sub} rank={i + 1} onNotesClick={() => setNotesTarget(sub)} />
              ))}
            </div>
          )
        ) : (
          <ScoreTable rankings={rankings} judges={judges} onNotesClick={setNotesTarget} />
        )}
      </div>

      {/* Notes modal */}
      {notesTarget && <NotesModal sub={notesTarget} onClose={() => setNotesTarget(null)} />}
    </div>
  );
}
