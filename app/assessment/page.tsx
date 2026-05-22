'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Brain, CheckCircle, AlertCircle, Loader2, ChevronRight, Sparkles, Trophy, UserCheck } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';
interface TeamOption { id: string; teamName: string; }

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; sublabel: string }> = {
  'Level 1': { bg: 'bg-slate-50',  border: 'border-slate-200', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-700 border border-slate-200',  sublabel: 'Can create prompts — self-help' },
  'Level 2': { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-100 text-red-700 border border-red-200',          sublabel: 'Can create tools — squad-level' },
  'Level 3': { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700 border border-amber-200',    sublabel: 'Can create production-level tools — org-wide' },
};

function getLevel(label: string) {
  const key = label?.match(/Level \d/)?.[0] ?? 'Level 1';
  return LEVEL_COLORS[key] ?? LEVEL_COLORS['Level 1'];
}

interface SubmitResult {
  mcScore: number;
  essayTotal: number | null;
  totalScore: number;
  totalPercent: number;
  preliminaryLevel: string;
  categoryRecommendation: string;
  overallExplanation: string | null;
  squadLeadNote: string | null;
  essayScoringFailed: boolean;
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>{score} / {max}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RadioOption({ name, value, label, points, selected, onChange }: {
  name: string; value: string; label: string; points: number;
  selected: boolean; onChange: (v: string) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-red-400 bg-red-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-red-500"
      />
      <span className="text-slate-700 text-sm flex-1">{label}</span>
      <span className="text-slate-400 text-xs flex-shrink-0">{points}pt{points !== 1 ? 's' : ''}</span>
    </label>
  );
}

function AssessmentForm() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [teamId, setTeamId] = useState(searchParams.get('teamId') || '');
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [rosterTeamName, setRosterTeamName] = useState<string | null>(null); // pre-assigned team name from roster
  const [rosterLoaded, setRosterLoaded] = useState(false);

  // Name + email come from Microsoft session — read-only
  const participantName  = session?.user?.name  ?? '';
  const participantEmail = session?.user?.email ?? '';

  // MC answers
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q5, setQ5] = useState('');

  // Essay answers
  const [q4, setQ4] = useState('');
  const [q6, setQ6] = useState('');
  const [q7, setQ7] = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    fetch('/api/register').then(r => r.json()).then(setTeams).catch(() => {});
  }, []);

  // Look up participant roster once we have the email from the session
  useEffect(() => {
    if (!participantEmail) return;
    fetch(`/api/participants?email=${encodeURIComponent(participantEmail)}`)
      .then(r => r.json())
      .then((p: { teamId?: string; teamName?: string } | null) => {
        if (p?.teamId) {
          setTeamId(p.teamId);
          setRosterTeamName(p.teamName ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setRosterLoaded(true));
  }, [participantEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, participantName, participantEmail, q1, q2, q3, q5, q4_essay: q4, q6_essay: q6, q7_essay: q7 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      setResult(data);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (status === 'success' && result) {
    const colors = getLevel(result.preliminaryLevel);
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className={`border ${colors.border} ${colors.bg} rounded-2xl p-8 mb-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Assessment Complete</p>
              <h2 className="text-slate-900 font-bold text-xl">Your Preliminary Level</h2>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3 ${colors.badge}`}>
            <Sparkles className="w-4 h-4" />
            {result.preliminaryLevel}
          </div>
          <p className={`text-sm font-medium mb-1 ${colors.text}`}>
            {colors.sublabel}
          </p>
          <p className="text-slate-400 text-xs mb-2">
            Category: <span className="text-slate-500">{result.categoryRecommendation}</span>
          </p>

          {result.overallExplanation && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-rose-400">
              <p className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Claude Summary
              </p>
              <p className="text-slate-700 text-sm leading-relaxed">{result.overallExplanation}</p>
            </div>
          )}

          {result.squadLeadNote && (
            <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-amber-400">
              <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2">Squad Lead Note</p>
              <p className="text-slate-700 text-sm leading-relaxed">{result.squadLeadNote}</p>
            </div>
          )}

          {result.essayScoringFailed && (
            <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 border-l-4 border-l-orange-400">
              <p className="text-slate-700 text-sm">Essay scoring is pending — your squad lead will review manually.</p>
            </div>
          )}
        </div>

        {/* Score breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-6">
          <h3 className="text-slate-900 font-semibold text-sm uppercase tracking-widest">Score Breakdown</h3>
          <ScoreBar label="Multiple Choice (Sections 1–3)" score={result.mcScore} max={17} />
          {result.essayTotal !== null && (
            <ScoreBar label="Essays (Sections 2–4)" score={result.essayTotal} max={24} />
          )}
          <div className="pt-2 border-t border-gray-200">
            <ScoreBar label="Total Score" score={result.totalScore} max={41} />
            <p className="text-right text-slate-400 text-xs mt-1">{result.totalPercent}%</p>
          </div>
        </div>

        <p className="text-slate-400 text-sm text-center mb-6">
          Your squad lead will review and confirm your final level before the event.
        </p>
        <a href="/register" className="block text-center bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all">
          Next: Register Your Team →
        </a>
        <a href="/" className="block text-center bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold py-3 rounded-xl transition-all">
          Back to Home
        </a>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-orange-400 text-xs uppercase tracking-widest">Step 01 — Individual</p>
            <h1 className="text-2xl font-bold text-slate-900">AI Proficiency Assessment</h1>
          </div>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">
          Complete all 7 questions honestly. Your answers will be scored automatically and a preliminary skill level assigned.
          Your squad lead will confirm the final level before the event.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Participant info — auto-filled from Microsoft sign-in + roster */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 font-semibold text-sm uppercase tracking-widest">Your Information</h2>
            <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5" /> Auto-filled from your account
            </span>
          </div>

          {/* Name + Email — locked from Microsoft session */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5">Full Name</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-slate-900 text-sm font-medium flex-1 truncate">
                  {participantName || <span className="text-slate-400 italic">Loading…</span>}
                </span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5">Email</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-slate-900 text-sm flex-1 truncate">
                  {participantEmail || <span className="text-slate-400 italic">Loading…</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Team — pre-assigned from roster or manual fallback */}
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5">
              Team <span className="text-red-400">*</span>
            </p>
            {rosterTeamName ? (
              /* Pre-assigned — show as locked field */
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-slate-900 text-sm font-medium flex-1">{rosterTeamName}</span>
                <span className="text-xs text-emerald-600 font-medium flex-shrink-0">Pre-assigned</span>
              </div>
            ) : (
              /* Not in roster — allow manual selection */
              <>
                {!rosterLoaded ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                    <Loader2 className="w-4 h-4 animate-spin" /> Checking roster…
                  </div>
                ) : (
                  <>
                    <select
                      required
                      value={teamId}
                      onChange={e => setTeamId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="">-- Select your team --</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                    </select>
                    <p className="text-slate-400 text-xs mt-1.5">
                      Your email wasn&apos;t found in the participant roster — please select your team manually.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Section 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">Section 1</span>
            <h2 className="text-slate-900 font-semibold">Claude & AI Familiarity</h2>
            <span className="text-slate-400 text-xs ml-auto">20% weight</span>
          </div>

          <div>
            <p className="text-slate-700 text-sm font-medium mb-3">
              <span className="text-slate-400 mr-2">Q1.</span>How often do you use Claude or any AI tool at work?
            </p>
            <div className="space-y-2">
              {[
                { v: 'A', label: 'I have never used any AI tool', pts: 1 },
                { v: 'B', label: 'I have tried it a few times out of curiosity', pts: 2 },
                { v: 'C', label: 'I use it occasionally for specific tasks', pts: 3 },
                { v: 'D', label: 'It is a regular part of my daily work', pts: 4 },
              ].map(o => <RadioOption key={o.v} name="q1" value={o.v} label={o.label} points={o.pts} selected={q1 === o.v} onChange={setQ1} />)}
            </div>
          </div>

          <div>
            <p className="text-slate-700 text-sm font-medium mb-3">
              <span className="text-slate-400 mr-2">Q2.</span>What do you mostly use Claude or AI for?
            </p>
            <div className="space-y-2">
              {[
                { v: 'A', label: 'I have not used it yet', pts: 1 },
                { v: 'B', label: 'Simple tasks like summarizing, rephrasing, or answering quick questions', pts: 2 },
                { v: 'C', label: 'Helping me complete work tasks faster and more efficiently', pts: 3 },
                { v: 'D', label: 'Designing workflows, generating insights, or automating processes', pts: 4 },
                { v: 'E', label: 'Building tools or integrations that I or my team use regularly', pts: 5 },
              ].map(o => <RadioOption key={o.v} name="q2" value={o.v} label={o.label} points={o.pts} selected={q2 === o.v} onChange={setQ2} />)}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full">Section 2</span>
            <h2 className="text-slate-900 font-semibold">Prompting Ability</h2>
            <span className="text-slate-400 text-xs ml-auto">30% weight</span>
          </div>

          <div>
            <p className="text-slate-700 text-sm font-medium mb-3">
              <span className="text-slate-400 mr-2">Q3.</span>How confident are you in writing prompts that get useful results from Claude?
            </p>
            <div className="space-y-2">
              {[
                { v: 'A', label: "Not confident — I'm not sure where to start", pts: 1 },
                { v: 'B', label: 'Somewhat confident — I can get basic results but they are inconsistent', pts: 2 },
                { v: 'C', label: 'Confident — my prompts usually give me what I need', pts: 3 },
                { v: 'D', label: 'Very confident — I can write complex, detailed prompts that consistently deliver great results', pts: 4 },
              ].map(o => <RadioOption key={o.v} name="q3" value={o.v} label={o.label} points={o.pts} selected={q3 === o.v} onChange={setQ3} />)}
            </div>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-700 text-sm font-medium">
                  <span className="text-slate-400 mr-2">Q4.</span>Think of a real task you do at work. Write the prompt you would give Claude to help you with it and explain why you wrote it that way.
                </p>
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> This answer will be scored by Claude AI
                </p>
              </div>
            </div>
            <textarea required rows={6} value={q4} onChange={e => setQ4(e.target.value)}
              placeholder="Write your prompt here, then explain your reasoning below it..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors resize-none leading-relaxed" />
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2.5 py-1 rounded-full">Section 3</span>
            <h2 className="text-slate-900 font-semibold">Workflow & Tool Building</h2>
            <span className="text-slate-400 text-xs ml-auto">30% weight</span>
          </div>

          <div>
            <p className="text-slate-700 text-sm font-medium mb-3">
              <span className="text-slate-400 mr-2">Q5.</span>Have you ever used AI to improve or automate part of your work?
            </p>
            <div className="space-y-2">
              {[
                { v: 'A', label: 'No, I have not tried this yet', pts: 1 },
                { v: 'B', label: 'I have thought about it but have not done it', pts: 2 },
                { v: 'C', label: 'Yes, I have used AI to assist in parts of my workflow', pts: 3 },
                { v: 'D', label: 'Yes, I have built and implemented AI-powered workflows or tools that others use', pts: 4 },
              ].map(o => <RadioOption key={o.v} name="q5" value={o.v} label={o.label} points={o.pts} selected={q5 === o.v} onChange={setQ5} />)}
            </div>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-700 text-sm font-medium">
                  <span className="text-slate-400 mr-2">Q6.</span>Describe a work problem you currently face that you think AI could help solve. How would you use Claude to address it? If you have already done something like this, tell us what you built and what impact it had.
                </p>
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> This answer will be scored by Claude AI
                </p>
              </div>
            </div>
            <textarea required rows={6} value={q6} onChange={e => setQ6(e.target.value)}
              placeholder="Describe the problem and how you would use Claude to solve it..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors resize-none leading-relaxed" />
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">Section 4</span>
            <h2 className="text-slate-900 font-semibold">AI Mindset</h2>
            <span className="text-slate-400 text-xs ml-auto">20% weight</span>
          </div>

          <div>
            <div className="flex items-start gap-2 mb-3">
              <ChevronRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-700 text-sm font-medium leading-relaxed">
                  <span className="text-slate-400 mr-2">Q7.</span>Thinking about the problem or tool you described in Section 3 — how does that reflect the bigger shift AI is bringing to support engineering work? What are you personally doing (or planning to do) to lead that change for your squad or team, not just for yourself?
                </p>
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> This answer will be scored by Claude AI
                </p>
              </div>
            </div>

            {/* Guide */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-3 space-y-2">
              <p className="text-orange-700 text-xs font-semibold uppercase tracking-widest">What a strong answer covers</p>
              <ul className="space-y-1.5">
                {[
                  { label: 'Connect to Section 3', desc: 'Use your Q6 example as the starting point — zoom out from that specific tool to the broader pattern it represents.' },
                  { label: 'Go beyond yourself', desc: 'How does this shift affect your squad or team? Who else benefits, and how?' },
                  { label: 'Show action, not intent', desc: 'What are you already doing — prompts you share, tools you documented, habits you built for others?' },
                  { label: 'Think forward', desc: 'Where does this go in 1–2 years, and how are you positioning yourself and your team for that?' },
                ].map(({ label, desc }) => (
                  <li key={label} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                    <span><strong className="text-slate-700">{label}:</strong> {desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <textarea required rows={7} value={q7} onChange={e => setQ7(e.target.value)}
              placeholder={`Build on your Section 3 answer:\n"The tool/problem I described is part of a bigger shift — AI is changing [broader pattern] across support work. Beyond my own use, I've started [specific action for the team, e.g. documenting prompts, training teammates, building shared tools]. In 1–2 years I see [where this goes], and I'm preparing by..."`}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors resize-none leading-relaxed text-sm" />
          </div>
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={status === 'loading'}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20">
          {status === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Scoring with Claude AI...</>
          ) : (
            <><CheckCircle className="w-4 h-4" /> Submit Assessment</>
          )}
        </button>
        <p className="text-center text-slate-400 text-xs">
          Your essays will be scored automatically by Claude. Results are shown immediately.
        </p>
      </form>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <NavBar />
      <Suspense fallback={<div className="text-slate-500 text-center py-20">Loading...</div>}>
        <AssessmentForm />
      </Suspense>
    </div>
  );
}
