'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Team, TeamMember, ProjectSubmission, Assessment, Participant } from '@/types';
import {
  Zap, Users, FileText, Brain, LogOut, RefreshCw, Home,
  ChevronDown, ChevronUp, Mail, Building2, Calendar,
  CheckCircle2, ShieldCheck, AlertTriangle, Sparkles,
  ThumbsUp, ArrowUp, ArrowDown, Loader2, Flag,
  Plus, Pencil, Trash2, X, UserPlus, Save,
  Upload, Download, CheckCircle, AlertCircle, Activity
} from 'lucide-react';
import * as XLSX from 'xlsx';

type Tab = 'overview' | 'teams' | 'submissions' | 'assessments' | 'validation' | 'participants' | 'aiUsage';

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

function SubmissionCard({ sub, onDeleted }: { sub: ProjectSubmission; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/admin/submissions/${sub.id}`, { method: 'DELETE' });
    setDeleting(false);
    setConfirming(false);
    onDeleted();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center px-5 py-4 gap-3">
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-3 flex-1 text-left min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {sub.teamName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-semibold truncate">{sub.teamName}</p>
            <p className="text-slate-400 text-xs">{new Date(sub.submittedAt).toLocaleString()}</p>
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {confirming ? (
            <>
              <span className="text-slate-500 text-xs">Delete?</span>
              <button onClick={handleDelete} disabled={deleting}
                className="text-xs bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50">
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
              </button>
              <button onClick={() => setConfirming(false)}
                className="text-xs border border-gray-200 text-slate-500 px-2.5 py-1 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                No
              </button>
            </>
          ) : (
            <button onClick={() => setConfirming(true)} title="Delete submission (team can resubmit)"
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

          <VerifiedUsagePanel
            participantEmail={assessment.participantEmail}
            claimedLevel={displayLevel}
          />

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

// ─── Verified AI Usage Panel ──────────────────────────────────────────────────

interface UsageSummary {
  siebelId: string;
  tokens: number;
  costUsd: number | null;
  tier: 'power' | 'active' | 'none';
  lastUpdated: string | null;
}

// Format a token count as "1.6B" / "245M" / "850K" / "750".
function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString('en-US');
}

function levelIndex(level?: string): 0 | 1 | 2 | -1 {
  if (!level) return -1;
  const m = level.match(/Level\s*(\d)/i);
  if (!m) return -1;
  const n = parseInt(m[1], 10);
  return (n === 1 ? 0 : n === 2 ? 1 : n === 3 ? 2 : -1) as 0 | 1 | 2 | -1;
}

type UsageFlag = { kind: 'ok' | 'warn' | 'bad' | 'info'; text: string } | null;

function VerifiedUsagePanel({
  participantEmail,
  claimedLevel,
  onFlagChange,
}: {
  participantEmail: string;
  claimedLevel?: string;
  onFlagChange?: (flag: UsageFlag) => void;
}) {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [state,   setState]   = useState<'loading' | 'no-siebel' | 'no-data' | 'ready'>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Look up the participant's siebelId by email.
        const p = await fetch(`/api/participants?email=${encodeURIComponent(participantEmail)}`).then(r => r.json());
        const siebelId = p?.siebelId as string | undefined;
        if (!siebelId) { if (!cancelled) setState('no-siebel'); return; }
        const data: UsageSummary | null = await fetch(`/api/admin/ai-usage/summary/${encodeURIComponent(siebelId)}`).then(r => r.json());
        if (cancelled) return;
        if (!data) { setState('no-data'); return; }
        setSummary(data);
        setState('ready');
      } catch {
        if (!cancelled) setState('no-data');
      }
    })();
    return () => { cancelled = true; };
  }, [participantEmail]);

  // Compute flag unconditionally so hook order stays stable across renders.
  const tierForFlag: 'power' | 'active' | 'none' = summary?.tier ?? 'none';
  const claimedIdxPre = levelIndex(claimedLevel);
  const tierIdxPre    = tierForFlag === 'power' ? 2 : tierForFlag === 'active' ? 1 : 0;
  let computedFlag: UsageFlag = null;
  if ((state === 'ready' || state === 'no-data') && claimedIdxPre >= 0) {
    if (claimedIdxPre === tierIdxPre) {
      computedFlag = { kind: 'ok', text: 'Verified — claimed level matches AI usage.' };
    } else if (claimedIdxPre > tierIdxPre) {
      const diff = claimedIdxPre - tierIdxPre;
      computedFlag = {
        kind: diff >= 2 ? 'bad' : 'warn',
        text:
          tierForFlag === 'none'
            ? `No verified usage but claimed ${claimedLevel}. Recommend downgrade.`
            : `Claimed ${claimedLevel} but verified usage only supports ${tierForFlag === 'power' ? 'Level 3' : 'Level 2'}.`,
      };
    } else {
      computedFlag = { kind: 'info', text: `Underclaimed — verified usage would support a higher level.` };
    }
  }
  useEffect(() => { onFlagChange?.(computedFlag); }, [computedFlag?.kind, computedFlag?.text, onFlagChange]);

  // Loading / empty states.
  if (state === 'loading') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-slate-400 flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />Loading verified usage…
      </div>
    );
  }
  if (state === 'no-siebel') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
        <p className="text-slate-700 font-semibold mb-0.5">Verified AI Usage</p>
        <p className="text-slate-400 text-xs">No Siebel ID on this participant — add one in the Participants tab to enable verification.</p>
      </div>
    );
  }
  // no-data → treat as "No Usage" (red) per agreed design.
  const tier: 'power' | 'active' | 'none' = summary?.tier ?? 'none';
  const tokens  = summary?.tokens  ?? 0;

  const tierStyle: Record<typeof tier, { bg: string; border: string; text: string; dot: string; label: string }> = {
    power:  { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Power User' },
    active: { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Active' },
    none:   { bg: 'bg-slate-50',    border: 'border-slate-200',   text: 'text-slate-600',   dot: 'bg-slate-400',   label: 'No Usage' },
  };
  const t = tierStyle[tier];

  const flag = computedFlag;
  const flagStyle: Record<NonNullable<typeof flag>['kind'], string> = {
    ok:   'bg-emerald-50 border-emerald-200 text-emerald-700',
    warn: 'bg-amber-50 border-amber-200 text-amber-700',
    bad:  'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={`${t.bg} ${t.border} border rounded-xl p-4 space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3 h-3" />Verified AI Usage
          </p>
          <p className="text-slate-900 font-bold text-2xl mt-0.5">{formatTokens(tokens)} <span className="text-slate-500 text-sm font-medium">tokens</span></p>
          {summary && (
            <p className="text-slate-400 text-xs mt-0.5">
              {tokens.toLocaleString('en-US')} total · siebelId: <span className="font-mono">{summary.siebelId}</span>
            </p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${t.border} ${t.text} bg-white/60`}>
          <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />{t.label}
        </span>
      </div>

      {flag && (
        <div className={`text-xs rounded-lg border px-2.5 py-2 ${flagStyle[flag.kind]}`}>
          {flag.kind === 'ok'   && <CheckCircle2  className="w-3 h-3 inline mr-1 -mt-0.5" />}
          {flag.kind === 'warn' && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
          {flag.kind === 'bad'  && <AlertCircle   className="w-3 h-3 inline mr-1 -mt-0.5" />}
          {flag.kind === 'info' && <Sparkles      className="w-3 h-3 inline mr-1 -mt-0.5" />}
          {flag.text}
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
  const [usageFlag, setUsageFlag] = useState<UsageFlag>(null);
  const handleFlagChange = useCallback((f: UsageFlag) => setUsageFlag(f), []);
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

      {usageFlag && (usageFlag.kind === 'bad' || usageFlag.kind === 'warn') && (
        <div className={`px-6 py-3 border-b text-sm flex items-start gap-2 ${
          usageFlag.kind === 'bad'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          {usageFlag.kind === 'bad' ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <div>
            <p className="font-semibold">AI Usage Mismatch</p>
            <p className="text-xs leading-relaxed mt-0.5">{usageFlag.text}</p>
          </div>
        </div>
      )}

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

        <VerifiedUsagePanel
          participantEmail={assessment.participantEmail}
          claimedLevel={assessment.preliminaryLevel}
          onFlagChange={handleFlagChange}
        />

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

interface ImportRow { name: string; email: string; teamName?: string; siebelId?: string; }
interface ImportResult { created: number; updated: number; skipped: number; errors: { row: number; email: string; reason: string }[]; }

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Name', 'Email Address', 'Squad', 'Siebel ID'],
    ['Ana Cruz', 'ana.cruz@trendmicro.com', 'Alpha Squad', 'acruz'],
    ['Juan Reyes', 'juan.reyes@trendmicro.com', 'Alpha Squad', 'jreyes'],
  ]);
  ws['!cols'] = [{ wch: 28 }, { wch: 36 }, { wch: 20 }, { wch: 16 }];
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
            siebelId: norm['siebel id']     || norm['siebelid']  || norm['siebel']   || '',
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
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wide">Siebel ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 text-slate-400">{i + 2}</td>
                        <td className="px-3 py-2 text-slate-700 font-medium">{r.name || <span className="text-red-400">missing</span>}</td>
                        <td className="px-3 py-2 text-slate-600">{r.email || <span className="text-red-400">missing</span>}</td>
                        <td className="px-3 py-2 text-slate-500">{r.teamName || <span className="text-slate-300 italic">none</span>}</td>
                        <td className="px-3 py-2 text-slate-500 font-mono">{r.siebelId || <span className="text-slate-300 italic">—</span>}</td>
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
  existingSquadNames,
  onClose,
  onSaved,
}: {
  initial?: Participant;
  teams: Team[];
  existingSquadNames: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [name,     setName]      = useState(initial?.name     ?? '');
  const [email,    setEmail]     = useState(initial?.email    ?? '');
  const [teamName, setTeamName]  = useState(initial?.teamName ?? '');
  const [siebelId, setSiebelId]  = useState(initial?.siebelId ?? '');
  const [saving,   setSaving]    = useState(false);
  const [error,    setError]     = useState('');

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    const cleanedTeamName = teamName.trim();
    // If the typed squad name happens to exactly match a registered hackathon team,
    // link the participant to that team (teamId) too. Otherwise it's just a
    // free-text squad — same shape as the Excel import.
    const matchedTeam = cleanedTeamName
      ? teams.find(t => t.teamName.toLowerCase() === cleanedTeamName.toLowerCase())
      : undefined;
    try {
      const url    = isEdit ? `/api/admin/participants/${initial!.id}` : '/api/admin/participants';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     name.trim(),
          email:    email.trim(),
          teamId:   matchedTeam?.id ?? null,
          teamName: cleanedTeamName || null,
          siebelId: siebelId.trim().toLowerCase() || null,
        }),
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
            <label className="block text-slate-600 text-sm mb-1.5">Squad / Team</label>
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              list="existing-squads"
              placeholder="e.g. Squad Kimiel"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
            />
            <datalist id="existing-squads">
              {existingSquadNames.map(n => <option key={n} value={n} />)}
              {teams.map(t => <option key={t.id} value={t.teamName} />)}
            </datalist>
            <p className="text-slate-400 text-xs mt-1">Free-text squad name (e.g. Squad Kimiel) or a registered hackathon team. Existing entries autocomplete.</p>
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1.5">Siebel ID <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="text" value={siebelId} onChange={e => setSiebelId(e.target.value)}
              placeholder="e.g. johnrusselc"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors font-mono text-sm" />
            <p className="text-slate-400 text-xs mt-1">Used to match Power BI AI usage data. Lowercase, no spaces.</p>
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

// ─── AI Usage Upload Modal ────────────────────────────────────────────────────

interface UsageRow { siebelId: string; tokens: number; costUsd?: number; }
interface UsageImportResult {
  inserted: number;
  distinctUsers: number;
  errors: { row: number; siebelId: string; reason: string }[];
  uploadedAt: string;
}

// Normalize a number from cells like 1_234_567, "$1,234.56", "1,702,281,647", "".
function parseNumberCell(cell: string | number | null | undefined): number | null {
  if (cell == null || cell === '') return null;
  if (typeof cell === 'number') return Number.isFinite(cell) ? cell : null;
  const cleaned = String(cell).replace(/[$,\s"]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function AIUsageUploadModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows]         = useState<UsageRow[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting]   = useState(false);
  const [result, setResult]         = useState<UsageImportResult | null>(null);

  // Parse the flat Power BI export: row 0 = headers (User Name, Cost, Tokens, …),
  // row 1+ = one row per user. Shared between xlsx and CSV.
  const parseAOA = (aoa: (string | number | null)[][]): { rows: UsageRow[]; error?: string } => {
    if (aoa.length < 2) return { rows: [], error: 'File has too few rows.' };
    const header = aoa[0].map(c => String(c ?? '').trim().toLowerCase());
    const userCol   = header.findIndex(h => h === 'user name' || h === 'username' || h === 'siebel id' || h === 'siebelid');
    const tokensCol = header.findIndex(h => h === 'tokens'    || h === 'token count' || h === 'total tokens');
    const costCol   = header.findIndex(h => h === 'cost'      || h === 'total cost'  || h === 'amount');
    if (userCol < 0)   return { rows: [], error: 'Could not find the User Name / Siebel ID column.' };
    if (tokensCol < 0) return { rows: [], error: 'Could not find the Tokens column.' };

    const out: UsageRow[] = [];
    for (let r = 1; r < aoa.length; r++) {
      const row = aoa[r];
      const siebel = row?.[userCol];
      if (!siebel) continue;
      const siebelId = String(siebel).trim().toLowerCase();
      if (siebelId === 'total' || siebelId === 'user name' || siebelId.startsWith('applied filters')) continue;

      const tokens = parseNumberCell(row[tokensCol]);
      if (tokens == null || tokens <= 0) continue;

      const costUsd = costCol >= 0 ? parseNumberCell(row[costCol]) ?? undefined : undefined;
      out.push({ siebelId, tokens, costUsd });
    }
    if (out.length === 0) return { rows: [], error: 'No usage rows found. Check that the file has the User Name + Tokens columns.' };
    return { rows: out };
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(''); setRows([]); setResult(null); setFileName(file.name);

    const isCsv = /\.csv$/i.test(file.name);
    const reader = new FileReader();

    reader.onload = ev => {
      try {
        let aoa: (string | number | null)[][];
        if (isCsv) {
          const text = String(ev.target?.result ?? '');
          const wb   = XLSX.read(text, { type: 'string' });
          const ws   = wb.Sheets[wb.SheetNames[0]];
          aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null }) as (string | number | null)[][];
        } else {
          const wb = XLSX.read(ev.target?.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null }) as (string | number | null)[][];
        }

        const { rows, error } = parseAOA(aoa);
        if (error) { setParseError(error); return; }
        setRows(rows);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Friendlier message for the most common corporate-IT failure: sensitivity-labeled xlsx.
        if (/ECMA-376|EncryptionInfo|encrypted/i.test(msg)) {
          setParseError(
            'This Excel file has a sensitivity / rights-management label that the parser cannot read. ' +
            'In Excel, choose File → Save As → save a new copy as CSV (Comma delimited), then upload the CSV here.',
          );
        } else {
          setParseError(msg || 'Could not read the file.');
        }
      }
    };

    if (isCsv) reader.readAsText(file);
    else       reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res  = await fetch('/api/admin/ai-usage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setResult(data);
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setImporting(false);
    }
  };

  // Quick preview summary: distinct users + total tokens.
  const distinctUsers = new Set(rows.map(r => r.siebelId)).size;
  const totalTokens   = rows.reduce((s, r) => s + r.tokens, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-slate-900 font-bold text-lg">Upload AI Usage Snapshot</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
            <p className="text-blue-800 font-semibold mb-1">Power BI export</p>
            <p className="text-blue-700/80 text-xs leading-relaxed">
              Open the AI usage report in Power BI → click the matrix → <strong>Export</strong> → <strong>Data with current layout</strong> → upload here.
              <strong>.xlsx or .csv</strong> both work — if the xlsx has a sensitivity label and won&apos;t parse, open it in Excel and Save As CSV instead.
              Uploads <strong>merge</strong> by Siebel ID — existing users get updated, new ones added. Use <strong>Clear snapshot</strong> to wipe everything.
            </p>
          </div>

          <div>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-red-300 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              {fileName ? (
                <p className="text-slate-700 font-medium text-sm">{fileName}</p>
              ) : (
                <>
                  <p className="text-slate-500 text-sm font-medium">Click to choose the Power BI export</p>
                  <p className="text-slate-400 text-xs mt-1">.xlsx, .xls, or .csv</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
          </div>

          {parseError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{parseError}</p>
            </div>
          )}

          {rows.length > 0 && !result && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
              <p className="text-slate-700 font-semibold">Preview</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-slate-900 font-bold">{distinctUsers}</p>
                  <p className="text-slate-500 text-xs">users</p>
                </div>
                <div>
                  <p className="text-slate-900 font-bold">{formatTokens(totalTokens)}</p>
                  <p className="text-slate-500 text-xs">total tokens</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{result.inserted}</p>
                  <p className="text-emerald-600 text-xs font-medium">rows inserted</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{result.distinctUsers}</p>
                  <p className="text-blue-600 text-xs font-medium">users covered</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1 text-xs">
                  <p className="text-red-700 font-semibold mb-1">Skipped rows:</p>
                  {result.errors.slice(0, 10).map((e, i) => (
                    <p key={i} className="text-red-600">Row {e.row} ({e.siebelId}): {e.reason}</p>
                  ))}
                  {result.errors.length > 10 && <p className="text-red-500 italic">+ {result.errors.length - 10} more…</p>}
                </div>
              )}
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />Upload complete
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
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Replace snapshot</>}
            </button>
          )}
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

  const existingSquadNames = useMemo(
    () => Array.from(new Set(participants.map(p => p.teamName).filter(Boolean) as string[])).sort(),
    [participants]
  );

  // AI Usage state
  const [usageMeta, setUsageMeta] = useState<{ count: number; lastUploadedAt: string | null }>({ count: 0, lastUploadedAt: null });
  const [showUsageUpload, setShowUsageUpload] = useState(false);

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
      const [t, s, a, p, u] = await Promise.all([
        fetch('/api/admin/teams').then(r => r.json()),
        fetch('/api/admin/submissions').then(r => r.json()),
        fetch('/api/admin/assessments').then(r => r.json()),
        fetch('/api/admin/participants').then(r => r.json()),
        fetch('/api/admin/ai-usage').then(r => r.json()).catch(() => ({ count: 0, lastUploadedAt: null })),
      ]);
      setTeams(t); setSubmissions(s); setAssessments(a); setParticipants(p); setUsageMeta(u);
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
    { id: 'aiUsage',      label: 'AI Usage',     icon: Activity },
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
          existingSquadNames={existingSquadNames}
          onClose={() => setShowAddParticipant(false)}
          onSaved={() => { setShowAddParticipant(false); fetchData(); }}
        />
      )}
      {editingParticipant && (
        <ParticipantFormModal
          initial={editingParticipant}
          teams={teams}
          existingSquadNames={existingSquadNames}
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
            <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <Home className="w-4 h-4" />Home
            </Link>
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
                <p className="text-slate-400 text-sm mt-0.5">Name, email, team pre-assignment, and Siebel ID for AI usage verification.</p>
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

            {participants.length > 0 && (() => {
              const missingSiebel = participants.filter(p => !p.siebelId).length;
              return missingSiebel > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">
                    <strong>{missingSiebel}</strong> of {participants.length} participants are missing a Siebel ID — AI usage verification won&apos;t work for them.
                  </p>
                </div>
              ) : null;
            })()}

            {participants.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No participants yet.</p>
                <p className="text-sm mt-1">Add participants so the assessment form auto-fills their team.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-5 py-3">
                  <p className="col-span-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Name</p>
                  <p className="col-span-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Email</p>
                  <p className="col-span-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">Siebel ID</p>
                  <p className="col-span-3 text-slate-500 text-xs font-semibold uppercase tracking-wide">Assigned Team</p>
                  <p className="col-span-1" />
                </div>
                {participants.map((p, i) => (
                  <div key={p.id} className={`grid grid-cols-12 px-5 py-3.5 items-center ${i < participants.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="col-span-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-slate-900 text-sm font-medium truncate">{p.name}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-1 text-slate-500 text-sm truncate">
                      <Mail className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      {p.email}
                    </div>
                    <div className="col-span-2">
                      {p.siebelId ? (
                        <span className="inline-flex items-center bg-slate-50 text-slate-700 border border-slate-200 rounded-md px-2 py-0.5 text-xs font-mono">
                          {p.siebelId}
                        </span>
                      ) : (
                        <span className="text-amber-500 text-xs italic">missing</span>
                      )}
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
              : submissions.map(s => <SubmissionCard key={s.id} sub={s} onDeleted={fetchData} />)}
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

        {tab === 'aiUsage' && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-slate-900 font-bold text-lg">AI Usage Verification</h2>
                <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                  Upload the monthly Power BI export to cross-check what participants claim against their actual Claude / AI spend.
                  Verification appears on each assessment in the Validation tab.
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {usageMeta.count > 0 && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete the current snapshot (${usageMeta.count.toLocaleString()} rows)? You can re-upload after.`)) return;
                      const res = await fetch('/api/admin/ai-usage', { method: 'DELETE' });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        alert(`Clear failed: ${data.error || res.statusText}`);
                        return;
                      }
                      fetchData();
                    }}
                    className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
                  >
                    <Trash2 className="w-4 h-4" />Clear snapshot
                  </button>
                )}
                <button onClick={() => setShowUsageUpload(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md shadow-red-500/20">
                  <Upload className="w-4 h-4" />Upload snapshot
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Users in snapshot</p>
                <p className="text-slate-900 font-bold text-2xl mt-1">{usageMeta.count.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">one row per user</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Last upload</p>
                <p className="text-slate-900 font-bold text-2xl mt-1">
                  {usageMeta.lastUploadedAt
                    ? new Date(usageMeta.lastUploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </p>
                <p className="text-slate-400 text-xs">
                  {usageMeta.lastUploadedAt ? new Date(usageMeta.lastUploadedAt).toLocaleTimeString() : 'No snapshot uploaded yet'}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Tiers</p>
                <div className="mt-2 space-y-1.5 text-xs font-medium">
                  <p className="text-emerald-700 flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />Power User · ≥ 1B tokens</p>
                  <p className="text-amber-700 flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />Active · 100M – 999M tokens</p>
                  <p className="text-slate-600 flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-2" />No Usage · &lt; 100M tokens</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 font-semibold">Heads up</p>
                <p className="text-blue-700/80 text-xs leading-relaxed mt-0.5">
                  Verification matches by <strong>Siebel ID</strong>. Make sure participants in the roster have their Siebel ID filled in
                  (Participants tab → Edit, or include a &quot;Siebel ID&quot; column in your Excel import).
                  Uploads <strong>merge</strong> by Siebel ID — re-upload to update or add users. Use <strong>Clear snapshot</strong> to wipe everything.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showUsageUpload && (
        <AIUsageUploadModal
          onClose={() => setShowUsageUpload(false)}
          onImported={() => { setShowUsageUpload(false); fetchData(); }}
        />
      )}
    </div>
  );
}
