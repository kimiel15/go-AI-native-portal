/**
 * Squad hierarchy for the Go AI-Native hackathon portal.
 *
 * Emails follow the pattern used in the participants table (firstname_lastname@trendmicro.com).
 * Update these if any email address doesn't match — the access endpoint will log
 * "unrecognised email" so mismatches are easy to spot.
 */

export interface SquadDef {
  name: string;         // matches the teamName field in the participants table
  leadEmail: string;    // squad lead's participant/login email
  leadName: string;
}

export interface ManagerDef {
  email: string;
  name: string;
  squads: SquadDef[];
}

export interface SquadLeadDef {
  email: string;
  name: string;
  squad: string;        // the single squad this person leads
}

// ── People Managers ────────────────────────────────────────────────────────────
export const MANAGERS: ManagerDef[] = [
  {
    email: 'karen_sioson@trendmicro.com',
    name: 'Karen Rose Sioson',
    squads: [
      { name: 'Squad Zean',  leadEmail: 'zean_grimaldo@trendmicro.com',   leadName: 'Zean Joshua Grimaldo' },
      { name: 'Squad Keren', leadEmail: 'keren_paras@trendmicro.com',     leadName: 'Keren Claire Paras' },
      { name: 'Squad Kimiel',leadEmail: 'kimiel_magpantay@trendmicro.com',leadName: 'Kimiel Magpantay' },
      { name: 'Squad Chrisa',leadEmail: 'chrisa_cabago@trendmicro.com',   leadName: 'Chrisa May Cabago' },
      { name: 'Squad Marga', leadEmail: 'gene_cofreros@trendmicro.com',   leadName: 'Gene Margarette Cofreros' },
    ],
  },
  {
    email: 'michael_limon@trendmicro.com',
    name: 'Michael Limon',
    squads: [
      { name: 'Squad Bea',                    leadEmail: 'beatriz_barcena@trendmicro.com',    leadName: 'Beatriz Barcena' },
      { name: 'Squad Judith',                 leadEmail: 'judith_velarde@trendmicro.com',     leadName: 'Judith Velarde' },
      { name: 'Squad Chris',                  leadEmail: 'christian_belando@trendmicro.com',  leadName: 'Christian Manuel Belando' },
      { name: 'Squad Joshua',                 leadEmail: 'joshua_avila@trendmicro.com',       leadName: 'Joshua Avila' },
      { name: 'Social and Digital Care Team', leadEmail: 'beatriz_barcena@trendmicro.com',    leadName: 'Beatriz Barcena' },
    ],
  },
  {
    email: 'jezriel_angelio@trendmicro.com',
    name: 'Jezriel Angelio',
    squads: [
      { name: 'Squad Darlene', leadEmail: 'darlene_gonzales@trendmicro.com',   leadName: 'Darlene Leann Gonzales' },
      { name: 'Squad Ian',     leadEmail: 'christian_nava@trendmicro.com',     leadName: 'Christian Edward Nava' },
      { name: 'Squad Ariane',  leadEmail: 'ariane_benzon@trendmicro.com',      leadName: 'Ariane Joy Benzon' },
      { name: 'Squad Ruel',    leadEmail: 'ruel_magkalas@trendmicro.com',      leadName: 'Ruel Paulo Magkalas' },
      { name: 'Squad Cassie',  leadEmail: 'cassandra_cofreros@trendmicro.com', leadName: 'Cassandra Yvonne Cofreros' },
      { name: 'Workforce Team',leadEmail: 'jezriel_angelio@trendmicro.com',    leadName: 'Jezriel Angelio' },
    ],
  },
];

// ── Squad Leads ────────────────────────────────────────────────────────────────
export const SQUAD_LEADS: SquadLeadDef[] = [
  { email: 'zean_grimaldo@trendmicro.com',     name: 'Zean Joshua Grimaldo',      squad: 'Squad Zean' },
  { email: 'keren_paras@trendmicro.com',        name: 'Keren Claire Paras',        squad: 'Squad Keren' },
  { email: 'kimiel_magpantay@trendmicro.com',   name: 'Kimiel Magpantay',          squad: 'Squad Kimiel' },
  { email: 'chrisa_cabago@trendmicro.com',      name: 'Chrisa May Cabago',         squad: 'Squad Chrisa' },
  { email: 'gene_cofreros@trendmicro.com',      name: 'Gene Margarette Cofreros',  squad: 'Squad Marga' },
  { email: 'beatriz_barcena@trendmicro.com',    name: 'Beatriz Barcena',           squad: 'Squad Bea' },
  { email: 'judith_velarde@trendmicro.com',     name: 'Judith Velarde',            squad: 'Squad Judith' },
  { email: 'christian_belando@trendmicro.com',  name: 'Christian Manuel Belando',  squad: 'Squad Chris' },
  { email: 'joshua_avila@trendmicro.com',       name: 'Joshua Avila',              squad: 'Squad Joshua' },
  { email: 'darlene_gonzales@trendmicro.com',   name: 'Darlene Leann Gonzales',    squad: 'Squad Darlene' },
  { email: 'christian_nava@trendmicro.com',     name: 'Christian Edward Nava',     squad: 'Squad Ian' },
  { email: 'ariane_benzon@trendmicro.com',      name: 'Ariane Joy Benzon',         squad: 'Squad Ariane' },
  { email: 'ruel_magkalas@trendmicro.com',      name: 'Ruel Paulo Magkalas',       squad: 'Squad Ruel' },
  { email: 'cassandra_cofreros@trendmicro.com', name: 'Cassandra Yvonne Cofreros', squad: 'Squad Cassie' },
];

// ── Lookup helpers ─────────────────────────────────────────────────────────────
export function getManagerAccess(email: string): ManagerDef | null {
  return MANAGERS.find(m => m.email === email.toLowerCase()) ?? null;
}

export function getSquadLeadAccess(email: string): SquadLeadDef | null {
  return SQUAD_LEADS.find(s => s.email === email.toLowerCase()) ?? null;
}

export type AccessRole = 'manager' | 'squad-lead' | 'none';

export interface AccessResult {
  role: AccessRole;
  name: string;
  squads: SquadDef[];          // populated for manager; single-item for squad-lead
}

export function resolveAccess(email: string): AccessResult {
  const e = email.toLowerCase();

  const manager = getManagerAccess(e);
  if (manager) return { role: 'manager', name: manager.name, squads: manager.squads };

  const lead = getSquadLeadAccess(e);
  if (lead) {
    // Build a minimal SquadDef for the squad lead's own squad
    const squadDef: SquadDef = { name: lead.squad, leadEmail: lead.email, leadName: lead.name };
    return { role: 'squad-lead', name: lead.name, squads: [squadDef] };
  }

  return { role: 'none', name: '', squads: [] };
}
