import { getSubmissions, getTeams } from '@/lib/data';
import NavBar from '@/components/NavBar';
import Link from 'next/link';
import { FileText, GitBranch, ArrowRight, ExternalLink, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage() {
  const [all, teams, session] = await Promise.all([getSubmissions(), getTeams(), auth()]);
  // Gallery only shows finalised submissions — drafts are private to the team
  const submissions = all.filter(s => s.status === 'submitted');

  // Figure out whether the current user is on a team and whether that team has already submitted
  const email = session?.user?.email?.toLowerCase();
  const myTeam = email
    ? teams.find(t => t.members.some(m => m.email?.toLowerCase() === email))
    : null;
  const mySubmission = myTeam
    ? all.find(s => s.teamId === myTeam.id && s.status === 'submitted')
    : null;
  const canSubmit = !!myTeam && !mySubmission;

  return (
    <div className="min-h-screen tl-page-bg">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tl-red to-tl-burgundy flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-tl-teal text-xs uppercase tracking-widest">Hackathon</p>
                <h1 className="text-2xl font-bold text-slate-900">Project Submissions</h1>
              </div>
            </div>
            <p className="text-slate-400 text-sm ml-[52px]">
              {submissions.length === 0
                ? 'No submissions yet — be the first!'
                : `${submissions.length} team${submissions.length !== 1 ? 's' : ''} submitted`}
            </p>
          </div>
          {mySubmission ? (
            <div className="flex-shrink-0 flex items-center gap-2 bg-tl-teal-light/20 border border-tl-teal-light text-tl-teal font-semibold px-5 py-2.5 rounded-xl text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Your team submitted
            </div>
          ) : canSubmit ? (
            <Link
              href="/submit"
              className="flex-shrink-0 flex items-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md shadow-rose-500/20"
            >
              <Plus className="w-4 h-4" />
              Submit Project
            </Link>
          ) : email ? (
            <Link
              href="/register"
              className="flex-shrink-0 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm border border-gray-200"
            >
              Register team first
            </Link>
          ) : null}
        </div>

        {/* Empty state */}
        {submissions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-200" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No projects submitted yet</p>
            <p className="text-slate-400 text-sm mb-8">Teams can submit from June 15 once production runs are complete.</p>
            {canSubmit && (
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
              >
                Submit Your Project <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub, i) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-5">
                  {/* Rank number */}
                  <span className="text-4xl font-black text-slate-100 flex-shrink-0 leading-none pt-1 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* Team + date */}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-3">
                      <h3 className="text-slate-900 font-bold text-lg leading-none">{sub.teamName}</h3>
                      <div className="flex items-center gap-1 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Headline result */}
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {sub.measuredResults}
                    </p>

                    {/* Repo link */}
                    <a
                      href={sub.gitRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-tl-teal hover:text-tl-sky text-sm font-medium transition-colors group/link"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      View Repository
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA — only show if the user is still allowed to submit */}
        {submissions.length > 0 && canSubmit && (
          <div className="mt-10 bg-white border border-tl-teal-light/40 rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-slate-900 font-semibold text-sm">Ready to submit your project?</p>
              <p className="text-slate-400 text-xs mt-0.5">Deadline: EOD June 21, 2026</p>
            </div>
            <Link
              href="/submit"
              className="flex-shrink-0 flex items-center gap-2 bg-tl-red hover:bg-tl-burgundy text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              Submit Your Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Confirmation for teams that have already submitted */}
        {submissions.length > 0 && mySubmission && (
          <div className="mt-10 bg-tl-teal-light/20 border border-tl-teal-light rounded-2xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-tl-teal flex-shrink-0" />
              <div>
                <p className="text-tl-teal font-semibold text-sm">Your team has already submitted</p>
                <p className="text-tl-teal/70 text-xs mt-0.5">
                  Submitted {new Date(mySubmission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — each team can submit only once.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
