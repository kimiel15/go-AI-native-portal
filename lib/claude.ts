import { ClaudeScoring } from '@/types';

const SCORING_SYSTEM_PROMPT = `You are an evaluator for the Go AI-Native Hackathon skill assessment. Your job is to score engineer essay answers and assign a preliminary skill level.

There are 3 skill levels:
- Level 1 – Prompt Creator: The engineer can write effective prompts that help themselves with individual tasks (self-help).
- Level 2 – Tool Builder: The engineer can build AI-powered tools or workflows that their squad or team uses (squad-level impact).
- Level 3 – Production Builder: The engineer can build and deploy production-ready AI tools used across the organization (org-wide impact).

For each essay answer provided, do the following:
1. Score the answer using the rubric provided (1–8 points per essay)
2. Write a 2–3 sentence explanation of the score
3. Note any red flags if the answer appears inflated or inauthentic

Be fair, consistent, and constructive. The goal is to place engineers in the right level so they can succeed — not to judge them.

Return your response ONLY as valid JSON in exactly this format:
{
  "section2_essay": {
    "score": <number 1-8>,
    "explanation": "<string>",
    "flag": "<string or null>"
  },
  "section3_essay": {
    "score": <number 1-8>,
    "explanation": "<string>",
    "flag": "<string or null>"
  },
  "section4_essay": {
    "score": <number 1-8>,
    "explanation": "<string>",
    "flag": "<string or null>"
  },
  "overall_level": "<Level 1 / Level 2 / Level 3>",
  "overall_explanation": "<2-3 sentence summary for the squad lead>",
  "category_recommendation": "<Prompt Creator / Tool Builder / Production Builder>",
  "squad_lead_note": "<optional note if score seems inflated or engineer shows higher potential, or null>"
}`;

function buildUserPrompt(q4: string, q6: string, q7: string): string {
  return `Please score the following three essay answers from the Go AI-Native Hackathon skill assessment.

---
SECTION 2 — Prompting Ability (Question 4)
Rubric:
- Level 1 (1–3pts): Vague or generic prompt with little structure or explanation. Reflects self-help use only — no indication of reusable or shareable prompts.
- Level 2 (4–5pts): Clear, structured prompt with context and defined output. Explanation shows understanding of prompt design. Could benefit others on their squad.
- Level 3 (6–8pts): Detailed, multi-part prompt with constraints, formatting, and advanced technique. Explanation is sophisticated. Prompt could serve as a production-ready template across the org.

Engineer's answer:
${q4}

---
SECTION 3 — Workflow & Tool Building (Question 6)
Rubric:
- Level 1 (1–3pts): Identifies a personal task or pain point but no concrete AI solution. Use case is self-contained — helps only themselves.
- Level 2 (4–5pts): Describes a clear problem and a practical AI-powered solution that would benefit their squad or team. Shows understanding of how Claude can be applied in a shared workflow.
- Level 3 (6–8pts): Presents a specific, production-ready tool or workflow — already built or fully thought through — with demonstrated or projected org-wide impact. Includes real business outcomes.

Engineer's answer:
${q6}

---
SECTION 4 — AI Mindset (Question 7)
Rubric:
- Level 1 (1–3pts): Acknowledges AI but reflection is surface level or personal only. No clear sense of how they are adapting or building for others.
- Level 2 (4–5pts): Thoughtful response showing genuine commitment to growing AI skills. Shows awareness of how AI changes team workflows, not just individual tasks.
- Level 3 (6–8pts): Forward-thinking, action-oriented response with clear examples of leading AI adoption at scale. Demonstrates an AI-first mindset already shaping org-wide practices.

Engineer's answer:
${q7}`;
}

export async function scoreEssays(q4: string, q6: string, q7: string): Promise<ClaudeScoring> {
  const baseUrl = (process.env.AI_ENDPOINT_URL ?? '').replace(/\/$/, '');
  const apiKey  = process.env.ANTHROPIC_API_KEY;
  const model   = process.env.AI_MODEL ?? 'claude-4.6-sonnet-aws';

  if (!baseUrl || !apiKey) throw new Error('AI_ENDPOINT_URL or ANTHROPIC_API_KEY is not configured.');

  // RDSEC ONE uses OpenAI-compatible Chat Completions format
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SCORING_SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(q4, q6, q7) },
      ],
      max_tokens: 1024,
      temperature: 0.5,
      stream: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '(no body)');
    throw new Error(`AI endpoint ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error(`Empty response. Full: ${JSON.stringify(data)}`);

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned) as ClaudeScoring;
}
