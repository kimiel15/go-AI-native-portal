'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '@/components/NavBar';
import { Users, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Info, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

interface Member { name: string; email: string; }
const emptyMember = (): Member => ({ name: '', email: '' });

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ExistingTeam { id: string; teamName: string; department: string; members: Member[]; registeredAt: string; }

export default function RegisterPage() {
  const { data: session } = useSession();
  const [teamName, setTeamName] = useState('');
  const [squad, setSquad] = useState('');
  const [squadLocked, setSquadLocked] = useState(false);   // true when pre-assigned from roster
  const [rosterLoaded, setRosterLoaded] = useState(false);
  // members[0] is always the leader (auto-filled from session, locked)
  const [members, setMembers] = useState<Member[]>([emptyMember(), emptyMember(), emptyMember()]);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [teamId, setTeamId] = useState('');
  const [existingTeam, setExistingTeam] = useState<ExistingTeam | null>(null);
  const [existingChecked, setExistingChecked] = useState(false);

  // Check whether the logged-in user is already on a team
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch('/api/my-team')
      .then(r => r.json())
      .then((t: ExistingTeam | null) => setExistingTeam(t))
      .catch(() => {})
      .finally(() => setExistingChecked(true));
  }, [session?.user?.email]);

  // Auto-fill Member 0 (leader) from the logged-in session
  useEffect(() => {
    if (!session?.user) return;
    setMembers(m => {
      const updated = [...m];
      updated[0] = {
        name: session.user?.name ?? '',
        email: session.user?.email ?? '',
      };
      return updated;
    });
  }, [session?.user?.name, session?.user?.email]);

  // Look up the logged-in user's squad from the participant roster
  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    fetch(`/api/participants?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then((p: { teamName?: string } | null) => {
        if (p?.teamName) {
          setSquad(p.teamName);
          setSquadLocked(true);
        }
      })
      .catch(() => {})
      .finally(() => setRosterLoaded(true));
  }, [session?.user?.email]);

  const addMember = () => {
    if (members.length < 4) setMembers(m => [...m, emptyMember()]);
  };
  const removeMember = (i: number) => {
    if (i === 0) return; // leader is locked
    if (members.length > 3) setMembers(m => m.filter((_, idx) => idx !== i));
  };
  const updateMember = (i: number, field: keyof Member, value: string) =>
    setMembers(m => m.map((mb, idx) => idx === i ? { ...mb, [field]: value } : mb));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (!squad.trim()) {
      setStatus('error');
      setMessage('Squad is required.');
      return;
    }

    const validMembers = members.filter(m => m.name && m.email);
    if (validMembers.length < 3) {
      setStatus('error');
      setMessage('Teams require at least 3 members with name and email filled in.');
      return;
    }
    if (validMembers.length > 4) {
      setStatus('error');
      setMessage('Teams may have a maximum of 4 members.');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName, department: squad, members: validMembers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
      setTeamId(data.teamId);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <NavBar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="bg-white border border-gray-200 rounded-2xl p-10">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Team Registered!</h2>
            <p className="text-slate-500 mb-6">
              <strong className="text-slate-900">{teamName}</strong> is in. Save your Team ID — you&apos;ll need it for your project submission.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
              <p className="text-red-300 text-xs uppercase tracking-widest mb-1">Your Team ID</p>
              <p className="text-slate-900 font-mono text-sm break-all">{teamId}</p>
            </div>
            <div className="flex flex-col gap-3">
              <a href={`/submit?teamId=${teamId}`}
                className="block bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all">
                Next: Submit Project Profile →
              </a>
              <a href="/" className="block bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold py-3 rounded-xl transition-all">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in user is already on a team — show summary instead of form
  if (existingChecked && existingTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <NavBar />
        <div className="max-w-xl mx-auto px-6 py-16">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-600 text-xs uppercase tracking-widest font-semibold">Already Registered</p>
                <h1 className="text-xl font-bold text-slate-900">You&apos;re on <span className="text-red-600">{existingTeam.teamName}</span></h1>
              </div>
            </div>

            <p className="text-slate-500 text-sm mb-5 leading-relaxed">
              Each person can only be on one team. You&apos;re already a member of <strong className="text-slate-700">{existingTeam.teamName}</strong> ({existingTeam.department}). If something looks wrong, contact an admin.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Team Members</p>
              <div className="space-y-2">
                {existingTeam.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-slate-500 text-xs font-medium flex-shrink-0">
                      {m.name?.charAt(0) ?? '?'}
                    </div>
                    <span className="text-slate-700 font-medium">{m.name}</span>
                    <span className="text-slate-400 text-xs">{m.email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a href={`/submit?teamId=${existingTeam.id}`}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all">
                Submit Project Profile <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/" className="block text-center bg-gray-100 hover:bg-gray-200 text-slate-900 font-semibold py-3 rounded-xl transition-all">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <NavBar />
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-red-400 text-xs uppercase tracking-widest">Step 02</p>
              <h1 className="text-2xl font-bold text-slate-900">Team Registration</h1>
            </div>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Register your team of <strong className="text-slate-900">3–4 engineers</strong>. Teams may form within or across squads.
            Every team formed must submit — there are no opt-outs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-slate-900 font-semibold text-sm uppercase tracking-widest">Team Information</h2>

            <div>
              <label className="block text-slate-600 text-sm mb-1.5">Team Name <span className="text-red-400">*</span></label>
              <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)}
                placeholder="e.g., Ctrl + AI + Del"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 text-sm">Squad <span className="text-red-400">*</span></label>
                {squadLocked && (
                  <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                    <UserCheck className="w-3.5 h-3.5" /> From your profile
                  </span>
                )}
              </div>
              {!rosterLoaded ? (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Looking up your squad…
                </div>
              ) : squadLocked ? (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-slate-900 text-sm font-medium flex-1">{squad}</span>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={squad}
                  onChange={e => setSquad(e.target.value)}
                  placeholder="Enter your squad name"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              )}
            </div>

          </div>

          {/* Team Members */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-slate-900 font-semibold text-sm uppercase tracking-widest">Team Members</h2>
                <p className="text-slate-400 text-xs mt-0.5">{members.length} / 4 slots · minimum 3</p>
              </div>
              {members.length < 4 && (
                <button type="button" onClick={addMember}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-700 text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              )}
            </div>

            {/* Size notice */}
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300/70 text-xs leading-relaxed">
                Three is the floor that prevents free-riders; four is the ceiling that keeps roles focused.
                Every member must have at least one meaningful Git commit under their own identity.
              </p>
            </div>

            {members.map((member, i) => (
              <div key={i} className={`rounded-xl p-4 space-y-3 ${i === 0 ? 'bg-red-50 border border-red-100' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
                    {i === 0 ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-600 font-semibold">Team Leader</span>
                        <span className="text-slate-400">(you)</span>
                      </>
                    ) : (
                      <>
                        Member {i + 1} {i < 2 ? <span className="text-red-400">*</span> : <span className="text-slate-400">(optional)</span>}
                      </>
                    )}
                  </span>
                  {i > 0 && members.length > 3 && i === members.length - 1 && (
                    <button type="button" onClick={() => removeMember(i)}
                      className="text-red-400/60 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" placeholder="Full Name"
                    value={member.name} onChange={e => updateMember(i, 'name', e.target.value)}
                    readOnly={i === 0}
                    className={`border rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none transition-colors ${i === 0 ? 'bg-white/60 border-red-200 text-slate-600 cursor-default' : 'bg-white border-gray-200 focus:border-red-500'}`} />
                  <input type="email" placeholder="Email Address"
                    value={member.email} onChange={e => updateMember(i, 'email', e.target.value)}
                    readOnly={i === 0}
                    className={`border rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none transition-colors ${i === 0 ? 'bg-white/60 border-red-200 text-slate-600 cursor-default' : 'bg-white border-gray-200 focus:border-red-500'}`} />
                </div>
              </div>
            ))}
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{message}</p>
            </div>
          )}

          <button type="submit" disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all">
            {status === 'loading'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
              : 'Register Team'}
          </button>
        </form>
      </div>
    </div>
  );
}
