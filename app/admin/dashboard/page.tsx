'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { Team, TeamMember, ProjectSubmission, Assessment, Participant } from '@/types';
import {
  Zap, Users, FileText, Brain, LogOut, RefreshCw,
  ChevronDown, ChevronUp, Mail, Building2, Calendar,
  CheckCircle2, ShieldCheck, AlertTriangle, Sparkles,
  ThumbsUp, ArrowUp, ArrowDown, Loader2, Flag,
  Plus, Pencil, Trash2, X, UserPlus, Save,
  Upload, Download, CheckCircle, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

type Tab = 'overview' | 'teams' | 'submissions' | 'assessments' | 'validation' | 'participants';

const LEVEL_BADGE: Record<string, string> = {
  'Level 1': 'bg-slate-100 text-slate-700 border-slate-200',
  'Level 2': 'bg-red-100 text-red-700 border-red-200',
  'Level 3': 'bg-amber-100 text-amber-700 border-amber-200',
};
function levelBadge(label: string) {
  const key = label?.match(/Level \d/)?.[0] ?? 'Level 1';
  return LEVEL_BADGE[key] ?? LEVEL_BADGE['Level 1'];
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

// ─── Team Form Modal ──────────────────────────────────────────────────────────

const EMPTY_MEMBER = (): TeamMember => ({ name: '', email: '', role: '' });

function TeamFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Team;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [teamName, setTeamName] = useState(initial?.teamName ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [members, setMembers] = useState<TeamMember[]>(
    initial?.members && initial.members.length > 0 ? initial.members : [EMPTY_MEMBER()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addMember = () => setMembers(m => [...m, EMPTY_MEMBER()]);
  const removeMember = (i: number) => setMembers(m => m.filter((_, idx) => idx !== i));
  const updateMember = (i: number, field: keyof TeamMember, value: string) =>
    setMembers(m => m.map((mem, idx) => idx === i ? { ...mem, [field]: value } : mem));

  const handleSave = async () => {
    if (!teamName.trim() || !department.trim()) {
      setError('Team name and department are required.');
      return;
    }
    const filledMembers = members.filter(m => m.name.trim() && m.email.trim());
    if (filledMembers.length === 0) {
      setError('At least one member with name and email is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = isEdit ? `/api/admin/teams/${initial!.id}` : '/api/admin/teams';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName.trim(), department: department.trim(), members: filledMembers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-slate-900 font-bold text-lg">
            {isEdit ? 'Edit Team' : 'Add Team'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-slate-600 text-sm mb-1.5">Team Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Alpha Squad"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-slate-600 text-sm mb-1.5">Department <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-600 text-sm">Members <span className="text-red-400">*</span></label>
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-500 font-medium transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />Add member
              </button>
            </div>

            <div className="space-y-3">
              {members.map((m, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-medium">Member {i + 1}</span>
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(i)}
                        className="text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={m.name}
                      onChange={e => updateMember(i, 'name', e.target.value)}
                      placeholder="Full name *"
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <input
                      type="email"
                      value={m.email}
                      onChange={e => updateMember(i, 'email', e.target.value)}
                      placeholder="Email *"
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={m.role}
                    onChange={e => updateMember(i, 'role', e.target.value)}
                    placeholder="Role (optional)"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />{isEdit ? 'Save Changes' : 'Create Team'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  team,
  onClose,
  onDeleted,
}: {
  team: Team;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/teams/${team.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      onDeleted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-slate-900 font-bold">Delete Team</p>
            <p className="text-slate-500 text-sm">This cannot be undone.</p>
          </div>
        </div>

        <p className="text-slate-700 text-sm">
          Are you sure you want to delete <strong>{team.teamName}</strong> and all their data?
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team Card (with edit/delete) ─────────────────────────────────────────────

function TeamCard({
  team,
  submissions,
  onEdit,
  onDelete,
}: {
  team: Team;
  submissions: ProjectSubmission[];
  onEdit: (t: Team) => void;
  onDelete: (t: Team) => void;
}) {
  const [open, setOpen] = useState(false);
  const sub = submissions.find(s => s.teamId === team.id);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 text-left flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {team.teamName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-semibold truncate">{team.teamName}</p>
            <div className="flex items-center gap-3 text-slate-400 text-xs mt-0.5">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{team.department}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {sub && <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" />Submitted</span>}
          <button
            onClick={() => onEdit(team)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit team"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(team)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete team"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setOpen(o => !o)} className="text-slate-400 ml-1">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-200 px-5 py-4 space-y-4">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Members</p>
          {team.members.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 text-xs font-medium">
                {m.name.charAt(0)}
              </div>
              <div>
                <p className="text-slate-900 text-sm font-medium">{m.name}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</p>
              </div>
              {m.role && <span className="ml-auto text-xs text-slate-400 bg-white px-2 py-0.5 rounded">{m.role}</span>}
            </div>
          ))}
          <div className="flex items-center gap-2 text-slate-400 text-xs pt-2">
            <Calendar className="w-3 h-3" />Registered: {new Date(team.registeredAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Submission Card ──────────────────────────────────────────────────────────

function SubmissionCard({ sub }: { sub: ProjectSubmission }) {
  const [open, setOpen] = useState(false);
  const sections = [
    { label: 'Git Repository', value: sub.gitRepoUrl },
    { label: 'Problem Statement', value: sub.problemStatement },
    { label: 'Solution Description', value: sub.solutionDescription },
    { label: 'Production Deployment Evidence', value: sub.productionEvidence },
    { label: 'Measured Results', value: sub.measuredResults },
    { label: 'Impact Math', value: sub.impactMath },
    { label: 'AI Usage (AI-USAGE.md)', value: sub.aiUsage },
    { label: 'Team Contributions (CONTRIBUTORS.md)', value: sub.teamContributions },
  ];
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
            {sub.teamName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-slate-900 font-semibold">{sub.teamName}</p>
            <p className="text-slate-400 text-xs">{new Date(sub.submittedAt).toLocaleString()}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-gray-200 px-5 py-4 space-y-5">
          {sections.filter(s => s.value).map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1.5">{label}</p>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Assessment Read Card ─────────────────────────────────────────────────────

function AssessmentReadCard({ assessment, onReset }: { assessment: Assessment; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await fetch(`/api/admin/assessments/${assessment.id}`, { method: 'DELETE' });
    setResetting(false);
    setConfirming(false);
    onReset();
  };
  const e = assessment.essayScores;
  const validated = assessment.validation;
  const displayLevel = validated?.finalLevel ?? assessment.preliminaryLevel ?? '—';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center px-5 py-4 gap-3">
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 flex-1 text-left min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {assessment.participantName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-semibold text-sm truncate">{assessment.participantName}</p>
            <p className="text-slate-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{assessment.participantEmail}</p>
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {displayLevel && (
            <span className={`text-xs border px-2.5 py-1 rounded-full ${levelBadge(displayLevel)}`}>{displayLevel}</span>
          )}
          {validated && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
          {confirming ? (
            <>
              <span className="text-slate-500 text-xs">Reset?</span>
              <button onClick={handleReset} disabled={resetting}
                className="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50">
                {resetting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
              </button>
              <button onClick={() => setConfirming(false)}
                className="text-xs border border-gray-200 text-slate-500 px-2.5 py-1 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                No
              </button>
            </>
          ) : (
            <button onClick={() => setConfirming(true)} title="Reset assessment"
              className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => setOpen(o => !o)} className="text-slate-400">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 px-5 py-4 space-y-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'MC Score', value: `${assessment.mcScore}/${assessment.mcMax}` },
              { label: 'Essay Score', value: assessment.essayTotal != null ? `${assessment.essayTotal}/${assessment.essayMax}` : '—' },
              { label: 'Total', value: `${assessment.totalScore ?? '—'}/${assessment.totalMax}` },
              { label: 'Percent', value: assessment.totalPercent != null ? `${assessment.totalPercent}%` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-3">
                <p className="text-slate-900 font-bold">{value}</p>
                <p className="text-slate-400 text-xs">{label}</p>
              </div>
            ))}
          </div>

          {e && (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs uppercase tracking-widest">Claude Essay Scores</p>
              {[
                { label: 'Section 2 — Prompting', data: e.section2_essay },
                { label: 'Section 3 — Workflow', data: e.section3_essay },
                { label: 'Section 4 — Mindset', data: e.section4_essay },
              ].map(({ label, data }) => (
                <div key={label} className="bg-white rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-600 text-sm font-medium">{label}</p>
                    <span className="text-slate-900 font-bold text-sm">{data.score}/8</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{data.explanation}</p>
                  {data.flag && (
                    <div className="flex items-start gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <Flag className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-300 text-xs">{data.flag}</p>
                    </div>
                  )}
                </div>
              ))}
              {e.overall_explanation && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-300 text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />Claude Summary
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed">{e.overall_explanation}</p>
                </div>
              )}
              {e.squad_lead_note && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-1">Squad Lead Note</p>
                  <p className="text-amber-700 text-sm">{e.squad_lead_note}</p>
                </div>
              )}
            </div>
          )}

          {validated && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />Squad Lead Validated
              </p>
              <p className="text-slate-600 text-sm">Final Level: <strong>{validated.finalLevel}</strong> ({validated.action})</p>
              <p className="text-slate-500 text-xs mt-1">Reason: {validated.reason}</p>
              <p className="text-slate-400 text-xs">By: {validated.validatedBy} · {new Date(validated.validatedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Validation Card ──────────────────────────────────────────────────────────

const LEVELS = [
  'Level 1 – Prompt Creator',
  'Level 2 – Tool Builder',
  'Level 3 – Production Builder',
];

function ValidationCard({ assessment, onValidated }: { assessment: Assessment; onValidated: () => void }) {
  const [action, setAction] = useState<'confirm' | 'upgrade' | 'downgrade' | ''>('');
  const [finalLevel, setFinalLevel] = useState(assessment.preliminaryLevel ?? '');
  const [reason, setReason] = useState('');
  const [validatedBy, setValidatedBy] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const validated = assessment.validation;
  const e = assessment.essayScores;

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
        body: JSON.stringify({ assessmentId: assessment.id, action, finalLevel, reason, validatedBy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onValidated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-slate-900 font-bold">
              {assessment.participantName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-slate-900 font-semibold">{assessment.participantName}</p>
              <p className="text-slate-400 text-xs">{assessment.participantEmail}</p>
            </div>
          </div>
          {validated ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />Validated
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />Pending Review
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
          {[
            { label: 'Section 1', sub: 'AI Familiarity', score: `${assessment.mcScore !== undefined ? assessment.mcScore : '—'}`, note: 'MC only' },
            { label: 'Section 2', sub: 'Prompting', score: e ? `${e.section2_essay.score}/8` : '—', note: 'Essay' },
            { label: 'Section 3', sub: 'Workflow', score: e ? `${e.section3_essay.score}/8` : '—', note: 'Essay' },
            { label: 'Section 4', sub: 'Mindset', score: e ? `${e.section4_essay.score}/8` : '—', note: 'Essay' },
          ].map(({ label, sub, score, note }) => (
            <div key={label} className="bg-white rounded-xl p-3">
              <p className="text-slate-900 font-bold">{score}</p>
              <p className="text-slate-500 text-xs font-medium">{label}</p>
              <p className="text-slate-400 text-xs">{sub}</p>
              <p className="text-slate-300 text-xs">{note}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
              style={{ width: `${assessment.totalPercent ?? 0}%` }}
            />
          </div>
          <span className="text-slate-900 font-bold text-sm">{assessment.totalPercent ?? 0}%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm">Preliminary:</span>
          <span className={`text-xs border px-2.5 py-1 rounded-full ${levelBadge(assessment.preliminaryLevel ?? '')}`}>
            {assessment.preliminaryLevel ?? '—'}
          </span>
          <span className="text-slate-400 text-xs ml-1">→ {assessment.categoryRecommendation}</span>
        </div>

        {e?.overall_explanation && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-300 text-xs font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />Claude&apos;s Summary
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">{e.overall_explanation}</p>
          </div>
        )}
        {e?.squad_lead_note && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-amber-300 text-xs font-semibold mb-1">Note for Squad Lead</p>
            <p className="text-amber-700 text-sm">{e.squad_lead_note}</p>
          </div>
        )}

        {validated ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
            <p className="text-emerald-300 text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />Final Level: {validated.finalLevel}
            </p>
            <p className="text-slate-500 text-xs">Action: {validated.action} · By: {validated.validatedBy}</p>
            <p className="text-slate-400 text-xs">Reason: {validated.reason}</p>
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-5 space-y-4">
            <p className="text-slate-500 text-sm font-medium">Squad Lead Action</p>

            <div className="flex gap-3">
              {[
                { id: 'confirm' as const, icon: ThumbsUp, label: 'Confirm', color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
                { id: 'upgrade' as const, icon: ArrowUp, label: 'Upgrade', color: 'border-red-400 bg-red-50 text-red-700' },
                { id: 'downgrade' as const, icon: ArrowDown, label: 'Downgrade', color: 'border-orange-400 bg-orange-50 text-orange-700' },
              ].map(({ id, icon: Icon, label, color }) => (
                <button key={id} type="button" onClick={() => setAction(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    action === id ? color : 'border-gray-200 text-slate-400 hover:border-gray-300 hover:text-slate-500'
                  }`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>

            {(action === 'upgrade' || action === 'downgrade') && (
              <div>
                <label className="block text-slate-500 text-sm mb-1.5">Final Level</label>
                <select value={finalLevel} onChange={e => setFinalLevel(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-red-500 transition-colors">
                  {LEVELS.map(l => <option key={l} value={l} className="bg-white">{l}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-500 text-sm mb-1.5">Reason <span className="text-red-400">*</span></label>
              <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Brief reason for your decision..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none" />
            </div>

            <div>
              <label className="block text-slate-500 text-sm mb-1.5">Your Name <span className="text-red-400">*</span></label>
              <input type="text" value={validatedBy} onChange={e => setValidatedBy(e.target.value)}
                placeholder="Squad lead name"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500" />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><ShieldCheck className="w-4 h-4" />Save Validation</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

// ─── Excel Import Modal ───────────────────────────────────────────────────────

interface ImportRow { name: string; email: string; teamName?: string; }
interface ImportResult { created: number; updated: number; skipped: number; errors: { row: number; email: string; reason: string }[]; }

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Name', 'Email Address', 'Squad'],
    ['Ana Cruz', 'ana.cruz@trendmicro.com', 'Alpha Squad'],
    ['Juan Reyes', 'juan.reyes@trendmicro.com', 'Alpha Squad'],
  ]);
  ws['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Participants');
  XLSX.writeFile(wb, 'participants-template.xlsx');
}

function ExcelImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(''); setRows([]); setResult(null); setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        // Normalise column names: trim + lowercase
        const parsed: ImportRow[] = raw.map(r => {
          const norm: Record<string, string> = {};
          Object.keys(r).forEach(k => { norm[k.trim().toLowerCase()] = String(r[k]).trim(); });
          return {
            name:     norm['name']          || norm['full name'] || norm['fullname'] || '',
            email:    norm['email address'] || norm['email']     || '',
            teamName: norm['squad']         || norm['team name'] || norm['team']    || norm['teamname'] || '',
          };
        }).filter(r => r.name || r.email);
        if (parsed.length === 0) { setParseError('No data rows found. Make sure row 1 has headers: Name, Email Address, Squad.'); return; }
        setRows(parsed);
      } catch {
        setParseError('Could not read the file. Please use the provided template.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/admin/participants/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Import failed.');
    } finally { setImporting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-slate-900 font-bold text-lg">Import from Excel</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Template download */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-blue-800 font-semibold text-sm">Step 1 — Download the template</p>
              <p className="text-blue-600 text-xs mt-0.5">Fill in Name, Email Address, and Squad columns. Squad name must match exactly.</p>
            </div>
            <button onClick={downloadTemplate}
              className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />Template
            </button>
          </div>

          {/* File picker */}
          <div>
            <p className="text-slate-700 font-semibold text-sm mb-2">Step 2 — Upload your filled file</p>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-red-300 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              {fileName ? (
                <p className="text-slate-700 font-medium text-sm">{fileName}</p>
              ) : (
                <>
                  <p className="text-slate-500 text-sm font-medium">Click to choose an Excel file</p>
                  <p className="text-slate-400 text-xs mt-1">.xlsx or .xls</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
          </div>

          {parseError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{parseError}</p>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && !result && (
            <div>
              <p className="text-slate-700 font-semibold text-sm mb-2">
                Step 3 — Preview ({rows.length} row{rows.length !== 1 ? 's' : ''})
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wide">#</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wide">Name</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wide">Email Address</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wide">Squad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-slate-400">{i + 2}</td>
                        <td className="px-3 py-2 text-slate-700 font-medium">{r.name || <span className="text-red-400">missing</span>}</td>
                        <td className="px-3 py-2 text-slate-600">{r.email || <span className="text-red-400">missing</span>}</td>
                        <td className="px-3 py-2 text-slate-500">{r.teamName || <span className="text-slate-300 italic">none</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{result.created}</p>
                  <p className="text-emerald-600 text-xs font-medium">Created</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                  <p className="text-blue-600 text-xs font-medium">Updated</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{result.skipped}</p>
                  <p className="text-amber-600 text-xs font-medium">Skipped</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                  <p className="text-red-700 text-xs font-semibold mb-2">Rows with errors:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-red-600 text-xs">Row {e.row}: {e.email} — {e.reason}</p>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />Import complete
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button onClick={result ? onImported : onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm font-medium hover:bg-gray-50">
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button onClick={handleImport} disabled={rows.length === 0 || importing}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" />Importing...</> : <><Upload className="w-4 h-4" />Import {rows.length > 0 ? `${rows.length} rows` : ''}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Participant Form Modal ───────────────────────────────────────────────────

function ParticipantFormModal({
  initial,
  teams,
  onClose,
  onSaved,
}: {
  initial?: Participant;
  teams: Team[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [name,     setName]     = useState(initial?.name     ?? '');
  const [email,    setEmail]    = useState(initial?.email    ?? '');
  const [teamId,   setTeamId]   = useState(initial?.teamId   ?? '');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    const selectedTeam = teams.find(t => t.id === teamId);
    try {
      const url    = isEdit ? `/api/admin/participants/${initial!.id}` : '/api/admin/participants';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), teamId: teamId || null, teamName: selectedTeam?.teamName || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-slate-900 font-bold text-lg">{isEdit ? 'Edit Participant' : 'Add Participant'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-slate-600 text-sm mb-1.5">Full Name <span className="text-red-400">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ana Cruz"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1.5">Email <span className="text-red-400">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ana.cruz@trendmicro.com"
              disabled={isEdit}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors disabled:bg-gray-50 disabled:text-slate-400" />
            {isEdit && <p className="text-slate-400 text-xs mt-1">Email cannot be changed after creation.</p>}
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1.5">Assigned Team</label>
            <select value={teamId} onChange={e => setTeamId(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-red-500 transition-colors">
              <option value="">-- No team assigned yet --</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
            </select>
            <p className="text-slate-400 text-xs mt-1">This will auto-fill the team field on the assessment form.</p>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />{isEdit ? 'Save Changes' : 'Add Participant'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Team CRUD modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  // Participant CRUD modal state
  const [showAddParticipant, setShowAddParticipant]     = useState(false);
  const [showImportModal,    setShowImportModal]        = useState(false);
  const [editingParticipant, setEditingParticipant]     = useState<Participant | null>(null);
  const [deletingParticipantId, setDeletingParticipantId] = useState<string | null>(null);
  const [deletingParticipantName, setDeletingParticipantName] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s, a, p] = await Promise.all([
        fetch('/api/admin/teams').then(r => r.json()),
        fetch('/api/admin/submissions').then(r => r.json()),
        fetch('/api/admin/assessments').then(r => r.json()),
        fetch('/api/admin/participants').then(r => r.json()),
      ]);
      setTeams(t); setSubmissions(s); setAssessments(a); setParticipants(p);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingValidation = assessments.filter(a => !a.validation).length;

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview',     label: 'Overview',     icon: Zap },
    { id: 'participants', label: 'Participants',  icon: UserPlus,   badge: participants.length },
    { id: 'teams',        label: 'Teams',        icon: Users,      badge: teams.length },
    { id: 'submissions',  label: 'Submissions',  icon: FileText,   badge: submissions.length },
    { id: 'assessments',  label: 'Assessments',  icon: Brain,      badge: assessments.length },
    { id: 'validation',   label: 'Validation',   icon: ShieldCheck, badge: pendingValidation || undefined },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Modals */}
      {showAddModal && (
        <TeamFormModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchData(); }}
        />
      )}
      {editingTeam && (
        <TeamFormModal
          initial={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSaved={() => { setEditingTeam(null); fetchData(); }}
        />
      )}
      {deletingTeam && (
        <DeleteConfirmModal
          team={deletingTeam}
          onClose={() => setDeletingTeam(null)}
          onDeleted={() => { setDeletingTeam(null); fetchData(); }}
        />
      )}
      {showImportModal && (
        <ExcelImportModal
          onClose={() => setShowImportModal(false)}
          onImported={() => { setShowImportModal(false); fetchData(); }}
        />
      )}
      {showAddParticipant && (
        <ParticipantFormModal
          teams={teams}
          onClose={() => setShowAddParticipant(false)}
          onSaved={() => { setShowAddParticipant(false); fetchData(); }}
        />
      )}
      {editingParticipant && (
        <ParticipantFormModal
          initial={editingParticipant}
          teams={teams}
          onClose={() => setEditingParticipant(null)}
          onSaved={() => { setEditingParticipant(null); fetchData(); }}
        />
      )}
      {deletingParticipantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-slate-900 font-bold">Remove Participant</p>
                <p className="text-slate-500 text-sm">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-slate-700 text-sm">Remove <strong>{deletingParticipantName}</strong> from the roster?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingParticipantId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={async () => {
                await fetch(`/api/admin/participants/${deletingParticipantId}`, { method: 'DELETE' });
                setDeletingParticipantId(null);
                fetchData();
              }} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl">
                <Trash2 className="w-4 h-4" />Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">Go AI-Native Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
            </button>
            <button onClick={async () => {
              await fetch('/api/admin/elevate', { method: 'DELETE' });
              await signOut({ callbackUrl: '/' });
            }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-8 w-fit">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-slate-900'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
              {badge != null && badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  id === 'validation' && badge > 0
                    ? 'bg-amber-100 text-amber-700'
                    : tab === id ? 'bg-red-500 text-white' : 'bg-gray-100 text-slate-500'
                }`}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-4 gap-4">
              <StatCard label="Registered Teams"    value={teams.length}       icon={Users}      color="from-red-500 to-rose-600" />
              <StatCard label="Project Submissions" value={submissions.length} icon={FileText}   color="from-rose-500 to-pink-600" />
              <StatCard label="Assessments Taken"   value={assessments.length} icon={Brain}      color="from-orange-500 to-red-600" />
              <StatCard label="Pending Validation"  value={pendingValidation}  icon={ShieldCheck} color="from-amber-500 to-orange-600" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-3">Recent Teams</h3>
                {teams.length === 0 ? <p className="text-slate-300 text-sm">No teams yet.</p> : (
                  <div className="space-y-2">
                    {teams.slice(-5).reverse().map(t => (
                      <div key={t.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold">
                          {t.teamName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-900 text-sm font-medium">{t.teamName}</p>
                          <p className="text-slate-400 text-xs">{t.department}</p>
                        </div>
                        {submissions.find(s => s.teamId === t.id) && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-3">Submission Rate</h3>
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-3xl font-bold text-slate-900">
                        {teams.length === 0 ? 0 : Math.round((submissions.length / teams.length) * 100)}%
                      </span>
                      <span className="text-slate-400 text-sm mb-1">of teams submitted</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all"
                        style={{ width: `${teams.length === 0 ? 0 : (submissions.length / teams.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-3">Validation Progress</h3>
                  <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-3xl font-bold text-slate-900">
                        {assessments.length === 0 ? 0 : Math.round(((assessments.length - pendingValidation) / assessments.length) * 100)}%
                      </span>
                      <span className="text-slate-400 text-sm mb-1">validated</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${assessments.length === 0 ? 0 : ((assessments.length - pendingValidation) / assessments.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants tab */}
        {tab === 'participants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-slate-900 font-bold text-lg">Participants ({participants.length})</h2>
                <p className="text-slate-400 text-sm mt-0.5">Name, email, and team pre-assignment. The assessment form auto-fills from this list.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  <Upload className="w-4 h-4" />Import Excel
                </button>
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20"
                >
                  <Plus className="w-4 h-4" />Add One
                </button>
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No participants yet.</p>
                <p className="text-sm mt-1">Add participants so the assessment form auto-fills their team.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-5 py-3">
                  <p className="col-span-4 text-slate-500 text-xs font-semibold uppercase tracking-wide">Name</p>
                  <p className="col-span-4 text-slate-500 text-xs font-semibold uppercase tracking-wide">Email</p>
                  <p className="col-span-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Assigned Team</p>
                  <p className="col-span-1" />
                </div>
                {participants.map((p, i) => (
                  <div key={p.id} className={`grid grid-cols-12 px-5 py-3.5 items-center ${i < participants.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-slate-900 text-sm font-medium truncate">{p.name}</span>
                    </div>
                    <div className="col-span-4 flex items-center gap-1 text-slate-500 text-sm truncate">
                      <Mail className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      {p.email}
                    </div>
                    <div className="col-span-3">
                      {p.teamName ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          <Users className="w-3 h-3" />{p.teamName}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs italic">Unassigned</span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button onClick={() => setEditingParticipant(p)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setDeletingParticipantId(p.id); setDeletingParticipantName(p.name); }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teams tab — full CRUD */}
        {tab === 'teams' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-lg">Registered Teams ({teams.length})</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20"
              >
                <Plus className="w-4 h-4" />Add Team
              </button>
            </div>
            {teams.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No teams yet.</p>
                <p className="text-sm mt-1">Click &quot;Add Team&quot; to register the first team.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map(t => (
                  <TeamCard
                    key={t.id}
                    team={t}
                    submissions={submissions}
                    onEdit={setEditingTeam}
                    onDelete={setDeletingTeam}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'submissions' && (
          <div className="space-y-3">
            <h2 className="text-slate-900 font-bold text-lg mb-4">Project Submissions ({submissions.length})</h2>
            {submissions.length === 0 ? <div className="text-center py-16 text-slate-400">No submissions yet.</div>
              : submissions.map(s => <SubmissionCard key={s.id} sub={s} />)}
          </div>
        )}

        {tab === 'assessments' && (
          <div className="space-y-3">
            <h2 className="text-slate-900 font-bold text-lg mb-4">Assessment Responses ({assessments.length})</h2>
            {assessments.length === 0 ? <div className="text-center py-16 text-slate-400">No assessments yet.</div>
              : assessments.map(a => <AssessmentReadCard key={a.id} assessment={a} onReset={fetchData} />)}
          </div>
        )}

        {tab === 'validation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-slate-900 font-bold text-lg">Squad Lead Validation</h2>
              {pendingValidation > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full">
                  {pendingValidation} pending
                </span>
              )}
            </div>

            {assessments.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No assessments to validate yet.</div>
            ) : (
              <>
                {assessments.filter(a => !a.validation).map(a => (
                  <ValidationCard key={a.id} assessment={a} onValidated={fetchData} />
                ))}
                {assessments.filter(a => !!a.validation).length > 0 && (
                  <>
                    <div className="flex items-center gap-3 pt-4">
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-slate-400 text-xs">Completed</span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    {assessments.filter(a => !!a.validation).map(a => (
                      <ValidationCard key={a.id} assessment={a} onValidated={fetchData} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
