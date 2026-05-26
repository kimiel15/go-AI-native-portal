'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import {
  Users, ShieldCheck, AlertTriangle, Loader2, ThumbsUp,
  ArrowUp, ArrowDown, ChevronDown, Sparkles, CheckCircle2,
  ClipboardList, Lock,
} from 'lucide-react';
import { Assessment } from '@/types';
import { SquadDef } from '@/lib/squad-hierarchy';

// ── Role types ─────────────────────────────────────────────────────────────────
type AccessRole = 'manager' | 'squad-lead' | 'none';

interface AccessResult {
  role: AccessRole;
  name: string;
  squads: SquadDef[];
}

// ── Constants ──────────────────────────────────────────────────────────────────
const LEVELS = [
  'Level 1 – Prompt Creator',
  'Level 2 – Tool Builder',
  'Level 3 – Production Builder',
];

function levelBadge(level: string) {
  if (level.includes('3')) return 'border-tl-teal/40 bg-tl-teal-light/20 text-tl-teal';
  if (level.includes('2')) return 'border-tl-orange/40 bg-orange-50 text-tl-orange';
  return 'border-rose-300 bg-rose-50 text-rose-600';
}

// ── Assessment Card ────────────────────────────────────────────────────────────
function AssessmentCard({
  assessment,
  defaultValidatedBy,
  onValidated,
}: {
  assessment: Assessment;
  defaultValidatedBy: string;
  onValidated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<'confirm' | 'upgrade' | 'downgrade' | ''>('');
  const [finalLevel, setFinalLevel] = useState(assessment.preliminaryLevel ?? '');
  const [reason, setReason] = useState('');
  const [validatedBy, setValidatedBy] = useState(defaultValidatedBy);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const validated = assessment.validation;
  const e = assessment.essayScores;
  const percent = assessment.totalPercent ?? 0;

  const handleSave = async () => {
    if (!action || !finalLevel || !reason.trim() || !validatedBy.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          action,
          finalLevel,
          reason,
          validatedBy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onValidated();
      setExpanded(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tl-red to-tl-burgundy flex items-center justify-center text-white font-bold flex-shrink-0">
              {assessment.participantName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 font-semibold truncate">{assessment.participantName}</p>
              <p className="text-slate-400 text-xs truncate">{assessment.participantEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {validated ? (
              <span className="flex items-center gap-1.5 text-xs text-tl-teal bg-tl-teal-light/20 border border-tl-teal-light px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Validated
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" /> Pending
              </span>
            )}
          </div>
        </div>

        {/* Score bar + level */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-tl-red to-tl-orange rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-slate-700 font-bold text-sm w-10 text-right">{percent}%</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {assessment.preliminaryLevel ? (
              <span className={`text-xs border px-2.5 py-1 rounded-full font-medium ${levelBadge(assessment.preliminaryLevel)}`}>
                {validated ? '→ ' : ''}{validated ? validated.finalLevel : assessment.preliminaryLevel}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">Not yet scored</span>
            )}
            {assessment.categoryRecommendation && (
              <span className="text-slate-400 text-xs">· {assessment.categoryRecommendation}</span>
            )}
            {validated && validated.action !== 'confirm' && (
              <span className="text-xs text-amber-600 font-medium">
                ({validated.action}d from {assessment.preliminaryLevel})
              </span>
            )}
          </div>
        </div>

        {/* Score breakdown pills */}
        {(assessment.mcScore !== undefined || e) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {assessment.mcScore !== undefined && (
              <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-slate-600">
                MC <strong>{assessment.mcScore}/{assessment.mcMax}</strong>
              </span>
            )}
            {e && (
              <>
                <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-slate-600">
                  Prompting <strong>{e.section2_essay.score}/8</strong>
                </span>
                <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-slate-600">
                  Workflow <strong>{e.section3_essay.score}/8</strong>
                </span>
                <span className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-slate-600">
                  Mindset <strong>{e.section4_essay.score}/8</strong>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Claude notes */}
      {(e?.overall_explanation || e?.squad_lead_note) && (
        <div className="px-6 pb-4 space-y-2">
          {e?.overall_explanation && (
            <div className="bg-tl-cream border border-tl-teal-light/40 rounded-xl p-3">
              <p className="text-tl-teal text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Claude&apos;s Summary
              </p>
              <p className="text-slate-600 text-xs leading-relaxed">{e.overall_explanation}</p>
            </div>
          )}
          {e?.squad_lead_note && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-1">Note for You</p>
              <p className="text-amber-800 text-xs leading-relaxed">{e.squad_lead_note}</p>
            </div>
          )}
        </div>
      )}

      {/* Already validated summary */}
      {validated && (
        <div className="px-6 pb-5">
          <div className="bg-tl-teal-light/15 border border-tl-teal-light/50 rounded-xl p-4 space-y-1">
            <p className="text-tl-teal text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Final: {validated.finalLevel}
            </p>
            <p className="text-slate-500 text-xs">
              {validated.action.charAt(0).toUpperCase() + validated.action.slice(1)}d by {validated.validatedBy}
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">&ldquo;{validated.reason}&rdquo;</p>
          </div>
        </div>
      )}

      {/* Validate panel toggle */}
      {assessment.preliminaryLevel && (
        <div className="border-t border-gray-100">
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-6 py-3.5 text-sm font-medium text-slate-600 hover:bg-gray-50 transition-colors"
          >
            <span>{validated ? 'Edit Validation' : 'Validate Assessment'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-5">
              {/* Action buttons */}
              <div className="flex gap-2">
                {([
                  { id: 'confirm'   as const, icon: ThumbsUp,  label: 'Confirm',   color: 'border-tl-teal bg-tl-teal-light/20 text-tl-teal' },
                  { id: 'upgrade'   as const, icon: ArrowUp,   label: 'Upgrade',   color: 'border-tl-sky bg-tl-teal-light/30 text-tl-sky' },
                  { id: 'downgrade' as const, icon: ArrowDown, label: 'Downgrade', color: 'border-tl-orange/60 bg-orange-50 text-tl-orange' },
                ] as const).map(({ id, icon: Icon, label, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setAction(id);
                      if (id === 'confirm') setFinalLevel(assessment.preliminaryLevel ?? '');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      action === id ? color : 'border-gray-200 text-slate-400 hover:border-gray-300 hover:text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>

              {(action === 'upgrade' || action === 'downgrade') && (
                <div>
                  <label className="block text-slate-600 text-sm mb-1.5">Final Level</label>
                  <select
                    value={finalLevel}
                    onChange={ev => setFinalLevel(ev.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-tl-teal transition-colors"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-600 text-sm mb-1.5">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={ev => setReason(ev.target.value)}
                  placeholder="Brief reason for your decision (e.g. 'Observed this person building production tools')"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-tl-teal resize-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-sm mb-1.5">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={validatedBy}
                  onChange={ev => setValidatedBy(ev.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-tl-teal transition-colors"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving || !action}
                className="w-full flex items-center justify-center gap-2 bg-tl-teal hover:bg-tl-sky disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Save Validation</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Squad Panel (shared by both roles) ────────────────────────────────────────
function SquadPanel({
  squad,
  validatedByDefault,
}: {
  squad: SquadDef;
  validatedByDefault: string;
}) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleValidated = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    setLoading(true);
    const url = new URL('/api/squad-lead/assessments', window.location.origin);
    url.searchParams.set('squad', squad.name);
    if (squad.leadEmail) url.searchParams.set('leadEmail', squad.leadEmail);
    fetch(url.toString())
      .then(r => r.json())
      .then(setAssessments)
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, [squad.name, squad.leadEmail, refreshKey]);

  const pending   = assessments.filter(a => !a.validation && a.preliminaryLevel).length;
  const validated = assessments.filter(a => !!a.validation).length;
  const notScored = assessments.filter(a => !a.preliminaryLevel).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading assessments…
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <ClipboardList className="w-7 h-7 text-amber-300" />
        </div>
        <p className="text-slate-700 font-semibold mb-1">No assessments yet</p>
        <p className="text-slate-400 text-sm">
          No members in <strong>{squad.name}</strong> have completed the assessment yet.
          The assessment window opens June 22.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { label: 'Pending Validation', value: pending,   color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Validated',          value: validated, color: 'text-tl-teal',   bg: 'bg-tl-teal-light/20 border-tl-teal-light' },
          { label: 'Not Yet Scored',     value: notScored, color: 'text-slate-400', bg: 'bg-gray-50 border-gray-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`border rounded-2xl p-4 text-center ${bg}`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* All validated banner */}
      {pending === 0 && notScored === 0 && (
        <div className="flex items-center gap-3 bg-tl-teal-light/20 border border-tl-teal-light rounded-2xl px-6 py-4">
          <CheckCircle2 className="w-5 h-5 text-tl-teal flex-shrink-0" />
          <p className="text-tl-teal text-sm font-semibold">
            All {validated} assessments validated — great work!
          </p>
        </div>
      )}

      {/* Pending first */}
      {assessments
        .filter(a => !a.validation && a.preliminaryLevel)
        .map(a => (
          <AssessmentCard
            key={a.id}
            assessment={a}
            defaultValidatedBy={validatedByDefault}
            onValidated={handleValidated}
          />
        ))}

      {/* Not scored */}
      {assessments
        .filter(a => !a.preliminaryLevel)
        .map(a => (
          <AssessmentCard
            key={a.id}
            assessment={a}
            defaultValidatedBy={validatedByDefault}
            onValidated={handleValidated}
          />
        ))}

      {/* Already validated */}
      {validated > 0 && (
        <>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest pt-2 px-1">
            Already Validated
          </p>
          {assessments
            .filter(a => !!a.validation)
            .map(a => (
              <AssessmentCard
                key={a.id}
                assessment={a}
                defaultValidatedBy={validatedByDefault}
                onValidated={handleValidated}
              />
            ))}
        </>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SquadLeadPage() {
  const { data: session, status } = useSession();
  const [access, setAccess] = useState<AccessResult | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [activeSquadName, setActiveSquadName] = useState('');

  // Fetch role-based access once the user is authenticated
  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoadingAccess(true);
    fetch('/api/squad-lead/access')
      .then(r => r.json())
      .then((data: AccessResult) => {
        setAccess(data);
        // Auto-select the first squad for squad leads (they only have one)
        if (data.role === 'squad-lead' && data.squads.length > 0) {
          setActiveSquadName(data.squads[0].name);
        }
        if (data.role === 'manager' && data.squads.length > 0) {
          setActiveSquadName(data.squads[0].name);
        }
      })
      .catch(() => setAccess({ role: 'none', name: '', squads: [] }))
      .finally(() => setLoadingAccess(false));
  }, [status]);

  // ── Loading spinner ────────────────────────────────────────────────────────
  if (status === 'loading' || loadingAccess) {
    return (
      <div className="min-h-screen tl-page-bg">
        <NavBar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen tl-page-bg">
        <NavBar />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tl-teal to-tl-sky flex items-center justify-center mx-auto mb-5">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Squad Lead Portal</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Sign in with your Trend Micro account to view your squad&apos;s assessment results and validate AI scores.
            </p>
            <button
              onClick={() => signIn('azure-ad')}
              className="w-full flex items-center justify-center gap-2 bg-tl-teal hover:bg-tl-sky text-white font-semibold py-3 rounded-xl transition-all"
            >
              Sign in with Microsoft
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── No access ──────────────────────────────────────────────────────────────
  if (access?.role === 'none') {
    return (
      <div className="min-h-screen tl-page-bg">
        <NavBar />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-10">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              This portal is only available to squad leads and people managers. If you believe you should have access, please contact your manager.
            </p>
            <p className="text-slate-400 text-xs mt-4">{session.user?.email}</p>
          </div>
        </div>
      </div>
    );
  }

  const role   = access?.role;
  const squads = access?.squads ?? [];
  const activeSquad = squads.find(s => s.name === activeSquadName) ?? squads[0];

  // ── Authenticated & authorised ─────────────────────────────────────────────
  return (
    <div className="min-h-screen tl-page-bg">
      <NavBar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tl-teal to-tl-sky flex items-center justify-center shadow-lg">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-tl-teal text-xs uppercase tracking-widest">
                {role === 'manager' ? 'People Manager' : 'Squad Lead'}
              </p>
              <h1 className="text-2xl font-bold text-slate-900">Assessment Validation</h1>
            </div>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed ml-[52px]">
            {role === 'manager'
              ? `Hi ${access?.name?.split(' ')[0] ?? ''}! Review and validate AI proficiency assessments across your squads.`
              : "Review your squad's AI proficiency results and confirm, upgrade, or downgrade the AI-assigned levels."}
          </p>
        </div>

        {/* Squad tabs (managers see multiple squads; squad leads see just their one) */}
        {squads.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-2 mb-6 flex flex-wrap gap-1">
            {squads.map(s => (
              <button
                key={s.name}
                type="button"
                onClick={() => setActiveSquadName(s.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeSquadName === s.name
                    ? 'bg-tl-teal text-white shadow-sm'
                    : 'text-slate-500 hover:bg-gray-50 hover:text-slate-700'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* Active squad label (squad leads & single-squad view) */}
        {squads.length === 1 && activeSquad && (
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-4 rounded-full bg-tl-teal" />
            <p className="text-sm font-semibold text-slate-700">{activeSquad.name}</p>
            {activeSquad.leadName && (
              <p className="text-xs text-slate-400">— led by {activeSquad.leadName}</p>
            )}
          </div>
        )}

        {/* Active squad panel */}
        {activeSquad && (
          <SquadPanel
            key={activeSquad.name}
            squad={activeSquad}
            validatedByDefault={access?.name ?? session.user?.name ?? ''}
          />
        )}
      </div>
    </div>
  );
}
