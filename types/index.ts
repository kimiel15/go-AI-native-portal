export interface TeamMember {
  name: string;
  email: string;
  role: string;
}

export interface Team {
  id: string;
  teamName: string;
  department: string;
  members: TeamMember[];
  registeredAt: string;
  submissionId?: string;
}

export interface ProjectSubmission {
  id: string;
  teamId: string;
  teamName: string;
  // Charter submission package fields
  gitRepoUrl: string;
  problemStatement: string;
  solutionDescription: string;
  productionEvidence: string;       // when/where/how many cases deployed
  measuredResults: string;          // actual numbers — tickets deflected, revenue generated
  impactMath: string;               // baseline, delta, calculation walkthrough
  aiUsage: string;                  // AI-USAGE.md — how Claude was used throughout
  teamContributions: string;        // CONTRIBUTORS.md — who did what
  status: 'draft' | 'submitted';   // draft = editable; submitted = locked for review
  submittedAt: string;
}

// ── Assessment ──────────────────────────────────────────────

export interface EssayScore {
  score: number;       // 1–8
  explanation: string;
  flag: string | null;
}

export interface ClaudeScoring {
  section2_essay: EssayScore;
  section3_essay: EssayScore;
  section4_essay: EssayScore;
  overall_level: string;            // "Level 1" | "Level 2" | "Level 3"
  overall_explanation: string;
  category_recommendation: string; // "Prompt Creator" | "Tool Builder" | "Production Builder"
  squad_lead_note: string | null;
}

export interface SquadLeadValidation {
  action: 'confirm' | 'upgrade' | 'downgrade';
  finalLevel: string;
  reason: string;
  validatedBy: string;
  validatedAt: string;
}

export interface Assessment {
  id: string;
  teamId: string;
  participantName: string;
  participantEmail: string;

  // Multiple choice answers (option letter: A/B/C/D/E)
  q1: string;
  q2: string;
  q3: string;
  q5: string;

  // Essay answers
  q4_essay: string;
  q6_essay: string;
  q7_essay: string;

  // Computed scores
  mcScore: number;           // raw multiple choice total
  mcMax: number;             // 17
  essayScores?: ClaudeScoring;
  essayTotal?: number;       // sum of 3 essay scores
  essayMax: number;          // 24
  totalScore?: number;       // mcScore + essayTotal
  totalMax: number;          // 41
  totalPercent?: number;     // 0–100

  // AI-assigned preliminary level
  preliminaryLevel?: string;
  categoryRecommendation?: string;

  // Squad lead validation
  validation?: SquadLeadValidation;

  submittedAt: string;
}

// Skill level thresholds (0-based percentage)
export const SKILL_LEVELS: { min: number; max: number; label: string; category: string }[] = [
  { min: 0,  max: 33,  label: 'Level 1 – Prompt Creator',       category: 'Self-Help'    },
  { min: 34, max: 66,  label: 'Level 2 – Tool Builder',          category: 'Squad-Level'  },
  { min: 67, max: 100, label: 'Level 3 – Production Builder',    category: 'Org-Wide'     },
];

// Multiple choice point mapping
export const MC_POINTS: Record<string, Record<string, number>> = {
  q1: { A: 1, B: 2, C: 3, D: 4 },
  q2: { A: 1, B: 2, C: 3, D: 4, E: 5 },
  q3: { A: 1, B: 2, C: 3, D: 4 },
  q5: { A: 1, B: 2, C: 3, D: 4 },
};
