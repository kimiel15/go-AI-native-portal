import { getTeams } from '@/lib/data';
import NavBar from '@/components/NavBar';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const teams = await getTeams();

  // Group teams by their assigned squad (department field)
  const bySquad = teams.reduce<Record<string, typeof teams>>((acc, team) => {
    const squad = team.department || 'Unassigned';
    if (!acc[squad]) acc[squad] = [];
    acc[squad].push(team);
    return acc;
  }, {});

  const squadNames = Object.keys(bySquad).sort();

  return (
    <div className="min-h-screen tl-page-bg">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tl-teal to-tl-sky flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-tl-teal text-xs uppercase tracking-widest">AI Tech Challenge</p>
            <h1 className="text-2xl font-bold text-slate-900">Team Roster</h1>
          </div>
          <span className="ml-auto text-slate-400 text-sm">
            {teams.length} team{teams.length !== 1 ? 's' : ''} registered
          </span>
        </div>

        {teams.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-tl-teal-light/20 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-tl-teal/30" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No teams registered yet</p>
            <p className="text-slate-400 text-sm">Teams will appear here once they register.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {squadNames.map(squadName => (
              <div key={squadName}>
                {/* Squad label */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-tl-teal bg-tl-teal-light/20 border border-tl-teal-light/40 px-3 py-1 rounded-full">
                    {squadName}
                  </span>
                  <span className="text-slate-300 text-xs">
                    {bySquad[squadName].length} team{bySquad[squadName].length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Team cards */}
                <div className="space-y-3">
                  {bySquad[squadName].map(team => (
                    <div
                      key={team.id}
                      className="bg-white border border-gray-200 rounded-2xl px-6 py-5 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-slate-900 font-bold text-base">{team.teamName}</h3>
                          <p className="text-tl-teal text-xs font-medium mt-0.5">{team.department}</p>
                        </div>
                        <span className="text-slate-300 text-xs flex-shrink-0 mt-1">
                          {new Date(team.registeredAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Members */}
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((m, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5"
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-tl-red to-tl-burgundy flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-700 text-sm">{m.name}</span>
                            {m.role === 'leader' && (
                              <span className="text-[10px] font-semibold text-tl-teal uppercase tracking-wide">
                                Lead
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
