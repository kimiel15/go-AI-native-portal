// One-off: build participants-import.xlsx from a participants JSON dump,
// deriving each Siebel ID by matching against the active Siebel IDs from the
// Power BI CSV. Falls back to firstname-concat + first letter of lastname.

import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'node:fs';

// Active Siebel IDs from the uploaded Power BI CSV (users with non-zero usage).
const ACTIVE_SIEBEL_IDS = new Set([
  'johnwilsonl','robemara','johnvincentt','lewmorcjamesb','aivandominich','kimielm',
  'johnrusselc','danielpe','christiann','delnardc','richardmichaell','josejuramerl',
  'dylanc','juniels','rodt','karens','emricq','carmelab','chrisamayc','raphaelj',
  'marklionelm','jezriela','zeang','joshuakyleb','christianjosephf','jayvees',
  'kerenclairep','jezreeljehany','genemargarettec','carmelaandraed','peterneilm',
  'renzlesterr','evanse','carlethanjustinev','czaienal','erroljamesn','marvicb',
  'judyannf','arianeb','ianrellym','ribenitor','kristinamajas','andreanicholet',
  'raymundol','allenma','marcjehielm','joniea','biancadesireeg','ruelpaulom',
  'joshuamaynardc','mayb','johncarloa','erikal','evelyne','josephp','noyleenv',
  'johnmichaelvincentb','eynav','maevelp','eronjomerc','jamieg','darleneleanng',
  'rupertc','arabellaa','marklyndonm','adrianjedm','leomarl','ivancrisrufm',
  'jaylieb','brandonr','kimberlyg','kimfrederickd','patrickdenzelc','glaizelo',
  'markjuliusd','myavernadetteb','cassandrayvonnec','reccalyns','adrianalexisv',
  'joshelles','angelos','liwaywayr','auriajom','thrishiamaried','azrielkylet',
  'wincyr','hannahpamelaf','carlwynjohnp','greggyjimivanp','emikhailvincentm',
]);

const PARTICLES = new Set(['de', 'del', 'dela', 'san', 'santa', 'santo']);

const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function tryMatch(base, suffixSource) {
  for (let k = 1; k <= suffixSource.length; k++) {
    const cand = base + suffixSource.slice(0, k);
    if (ACTIVE_SIEBEL_IDS.has(cand)) return cand;
  }
  return null;
}

function deriveSiebelId(name, email) {
  // Strategy 1: name-based (handles "Dela Cruz" etc.)
  const words = stripAccents(name).split(/\s+/).filter(Boolean);
  let nameCand = null;
  if (words.length >= 2) {
    let i = words.length - 1;
    while (i > 0 && PARTICLES.has(words[i - 1].toLowerCase())) i--;
    const base   = words.slice(0, i).join('').toLowerCase();
    const lastWd = words[i].toLowerCase();
    nameCand = tryMatch(base, lastWd) ?? (base + lastWd[0]);
  }

  // Strategy 2: email-based (handles cases like allen_malapit where the
  // middle name in the display name isn't in the company login).
  let emailCand = null;
  const prefix = (email ?? '').split('@')[0].toLowerCase();
  const parts  = prefix.split('_').filter(Boolean);
  if (parts.length >= 2) {
    const base   = parts[0];
    const lastWd = parts[1];
    emailCand = tryMatch(base, lastWd) ?? (base + lastWd[0]);
  } else if (parts.length === 1) {
    emailCand = parts[0];
  }

  // Prefer whichever lands on a verified active Siebel ID.
  if (emailCand && ACTIVE_SIEBEL_IDS.has(emailCand)) return emailCand;
  if (nameCand  && ACTIVE_SIEBEL_IDS.has(nameCand))  return nameCand;
  // Both fell back; the email-derived one is usually closer to the real login.
  return emailCand ?? nameCand ?? '';
}

const participants = JSON.parse(readFileSync('scripts/participants.json', 'utf8'));

const rows = [['Name', 'Email Address', 'Squad', 'Siebel ID']];
for (const p of participants) {
  rows.push([
    p.name,
    p.email,
    p.teamName ?? '',
    p.siebelId ?? deriveSiebelId(p.name, p.email),
  ]);
}

const ws = XLSX.utils.aoa_to_sheet(rows);
ws['!cols'] = [{ wch: 28 }, { wch: 38 }, { wch: 22 }, { wch: 18 }];
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Participants');
XLSX.writeFile(wb, 'participants-import.xlsx');

const matched = participants.filter(p => ACTIVE_SIEBEL_IDS.has(p.siebelId ?? deriveSiebelId(p.name, p.email))).length;
console.log(`Wrote participants-import.xlsx with ${participants.length} rows`);
console.log(`${matched} matched to an active Siebel ID from the CSV; ${participants.length - matched} fell back to derived best-guess`);
