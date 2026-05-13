'use client';
import { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Users, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';

interface Member { name: string; email: string; role: string; }
const emptyMember = (): Member => ({ name: '', email: '', role: '' });

type Status = 'idle' | 'loading' | 'success' | 'error';

const SQUADS = [
  'Zean', 'Darlene', 'Bea – PS Phones',
  'Keren', 'Josh', 'Kimiel – Std Phones',
  'Marga', 'Judith', 'Cassie',
  'Chrisa', 'Kimiel – Chat', 'Ariane',
  'Ruel', 'Ian', 'Bea – SDC', 'Chris',
];

export default function RegisterPage() {
  const [teamName, setTeamName] = useState('');
  const [squad, setSquad] = useState('');
  const [crossSquad, setCrossSquad] = useState(false);
  const [members, setMembers] = useState<Member[]>([emptyMember(), emptyMember(), emptyMember()]);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [teamId, setTeamId] = useState('');

  const addMember = () => {
    if (members.length < 4) setMembers(m => [...m, emptyMember()]);
  };
  const removeMember = (i: number) => {
    if (members.length > 3) setMembers(m => m.filter((_, idx) => idx !== i));
  };
  const updateMember = (i: number, field: keyof Member, value: string) =>
    setMembers(m => m.map((mb, idx) => idx === i ? { ...mb, [field]: value } : mb));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

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
        body: JSON.stringify({ teamName, department: squad, members: validMembers, crossSquad }),
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
              <label className="block text-slate-600 text-sm mb-1.5">Squad <span className="text-red-400">*</span></label>
              <select required value={squad} onChange={e => setSquad(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-red-500 transition-colors">
                <option value="" className="bg-white">-- Select your squad --</option>
                {SQUADS.map(s => <option key={s} value={s} className="bg-white">{s}</option>)}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={crossSquad} onChange={e => setCrossSquad(e.target.checked)}
                className="w-4 h-4 accent-red-500 rounded" />
              <span className="text-slate-500 text-sm">This is a cross-squad team</span>
            </label>
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
              <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-medium">
                    Member {i + 1} {i < 3 ? <span className="text-red-400">*</span> : <span className="text-slate-400">(optional)</span>}
                  </span>
                  {members.length > 3 && i === members.length - 1 && (
                    <button type="button" onClick={() => removeMember(i)}
                      className="text-red-400/60 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="Full Name"
                    value={member.name} onChange={e => updateMember(i, 'name', e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />
                  <input type="email" placeholder="Email Address"
                    value={member.email} onChange={e => updateMember(i, 'email', e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />
                  <input type="text" placeholder="Role (e.g., Builder)"
                    value={member.role} onChange={e => updateMember(i, 'role', e.target.value)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors" />
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
