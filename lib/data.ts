import fs from 'fs';
import path from 'path';
import { Team, ProjectSubmission, Assessment } from '@/types';

const dataDir = path.join(process.cwd(), 'data');

function readJSON<T>(filename: string): T[] {
  const file = path.join(dataDir, filename);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8');
  try { return JSON.parse(raw); } catch { return []; }
}

function writeJSON<T>(filename: string, data: T[]): void {
  const file = path.join(dataDir, filename);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// Teams
export function getTeams(): Team[] { return readJSON<Team>('teams.json'); }
export function saveTeam(team: Team): void {
  const teams = getTeams();
  teams.push(team);
  writeJSON('teams.json', teams);
}
export function updateTeam(id: string, updates: Partial<Team>): void {
  const teams = getTeams();
  const idx = teams.findIndex(t => t.id === id);
  if (idx !== -1) { teams[idx] = { ...teams[idx], ...updates }; writeJSON('teams.json', teams); }
}

// Submissions
export function getSubmissions(): ProjectSubmission[] { return readJSON<ProjectSubmission>('submissions.json'); }
export function saveSubmission(sub: ProjectSubmission): void {
  const subs = getSubmissions();
  const idx = subs.findIndex(s => s.teamId === sub.teamId);
  if (idx !== -1) { subs[idx] = sub; } else { subs.push(sub); }
  writeJSON('submissions.json', subs);
}

// Assessments
export function getAssessments(): Assessment[] { return readJSON<Assessment>('assessments.json'); }
export function saveAssessment(assessment: Assessment): void {
  const assessments = getAssessments();
  const idx = assessments.findIndex(a => a.participantEmail === assessment.participantEmail);
  if (idx !== -1) { assessments[idx] = assessment; } else { assessments.push(assessment); }
  writeJSON('assessments.json', assessments);
}
export function updateAssessment(id: string, updates: Partial<Assessment>): void {
  const assessments = getAssessments();
  const idx = assessments.findIndex(a => a.id === id);
  if (idx !== -1) { assessments[idx] = { ...assessments[idx], ...updates }; writeJSON('assessments.json', assessments); }
}
