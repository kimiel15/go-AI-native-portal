# Synapse AI Hackathon — Skill Assessment System

## Project Overview

Build an AI-powered skill assessment tool for the Synapse AI Hackathon. Engineers complete a mixed multiple choice and essay assessment. Claude scores the essays automatically and assigns a preliminary skill level. Squad leads then validate and confirm or adjust the final level.

---

## Assessment Structure

The assessment has 4 sections combining multiple choice and essay questions.

### Section 1: Claude & AI Familiarity
**Format:** Multiple Choice
**Weight:** 20%

**Question 1:** How often do you use Claude or any AI tool at work?
- Option A (1pt): I have never used any AI tool
- Option B (2pts): I have tried it a few times out of curiosity
- Option C (3pts): I use it occasionally for specific tasks
- Option D (4pts): It is a regular part of my daily work

**Question 2:** What do you mostly use Claude or AI for?
- Option A (1pt): I have not used it yet
- Option B (2pts): Simple tasks like summarizing, rephrasing, or answering quick questions
- Option C (3pts): Helping me complete work tasks faster and more efficiently
- Option D (4pts): Designing workflows, generating insights, or automating processes
- Option E (5pts): Building tools or integrations that I or my team use regularly

---

### Section 2: Prompting Ability
**Format:** Multiple Choice + Essay
**Weight:** 30%

**Question 3 (Multiple Choice):** How confident are you in writing prompts that get useful results from Claude?
- Option A (1pt): Not confident — I am not sure where to start
- Option B (2pts): Somewhat confident — I can get basic results but they are inconsistent
- Option C (3pts): Confident — my prompts usually give me what I need
- Option D (4pts): Very confident — I can write complex, detailed prompts that consistently deliver great results

**Question 4 (Essay):** Think of a real task you do at work. Write the prompt you would give Claude to help you with it and explain why you wrote it that way.

**Essay Scoring Rubric for Claude:**
- Level 1 (1–2pts): Vague or very generic prompt with no structure or explanation
- Level 2 (3–4pts): Basic prompt with some context; explanation is surface level
- Level 3 (5–6pts): Clear, structured prompt with defined output format; explanation shows understanding of why structure matters
- Level 4 (7–8pts): Detailed, multi-part prompt with specific instructions, constraints, and formatting; explanation demonstrates advanced prompting technique

---

### Section 3: Workflow & Tool Building
**Format:** Multiple Choice + Essay
**Weight:** 30%

**Question 5 (Multiple Choice):** Have you ever used AI to improve or automate part of your work?
- Option A (1pt): No, I have not tried this yet
- Option B (2pts): I have thought about it but have not done it
- Option C (3pts): Yes, I have used AI to assist in parts of my workflow
- Option D (4pts): Yes, I have built and implemented AI-powered workflows or tools that others use

**Question 6 (Essay):** Describe a work problem you currently face that you think AI could help solve. How would you use Claude to address it? If you have already done something like this, tell us what you built and what impact it had.

**Essay Scoring Rubric for Claude:**
- Level 1 (1–2pts): No clear problem identified; very vague or general response
- Level 2 (3–4pts): Problem identified but solution is vague; no mention of how Claude would be used specifically
- Level 3 (5–6pts): Clear problem with a practical AI solution described; shows understanding of how Claude could be applied
- Level 4 (7–8pts): Specific problem with a detailed, actionable solution already built or clearly thought through; demonstrates real business impact

---

### Section 4: AI Mindset
**Format:** Essay Only
**Weight:** 20%

**Question 7 (Essay):** In your own words, how do you see AI changing the way support engineers work? How are you personally preparing for or adapting to that change?

**Essay Scoring Rubric for Claude:**
- Level 1 (1–2pts): Generic or dismissive response; no personal reflection
- Level 2 (3–4pts): Acknowledges AI's potential but reflection is surface level; limited personal commitment
- Level 3 (5–6pts): Thoughtful response with specific examples of how AI will change work; shows genuine personal effort to adapt
- Level 4 (7–8pts): Insightful, forward-thinking response with clear personal action steps; demonstrates an AI-first mindset already in practice

---

## Scoring & Skill Level Mapping

### Score Calculation
1. Add up all multiple choice points
2. Add all essay scores from Claude
3. Normalize to a percentage based on total possible points
4. Map to skill level using the table below

### Skill Level Mapping

| Score Range | Skill Level | Category Recommendation |
|-------------|-------------|--------------------------|
| 0–25% | Level 1 – User: Basic Prompting | Claude Skill |
| 26–50% | Level 2 – User: Assisted Execution | Claude Skill |
| 51–75% | Level 3 – Operator: Workflow Ownership | Claude-Powered Tool |
| 76–100% | Level 4 – Builder: Tool Creation | Claude-Powered Tool |

---

## Claude Scoring Prompt

Use the following system prompt when sending essay answers to Claude for scoring:

```
You are an evaluator for the Synapse AI Hackathon skill assessment. Your job is to score engineer essay answers and assign a preliminary skill level.

For each essay answer provided, do the following:
1. Score the answer using the rubric provided (1–8 points per essay)
2. Write a 2–3 sentence explanation of the score
3. Note any red flags if the answer appears inflated or inauthentic

Be fair, consistent, and constructive. The goal is to place engineers in the right category so they can succeed — not to judge them.

Return your response in the following JSON format:
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
  "overall_level": "<Level 1 / Level 2 / Level 3 / Level 4>",
  "overall_explanation": "<2-3 sentence summary for the squad lead>",
  "category_recommendation": "<Claude Skill / Claude-Powered Tool>",
  "squad_lead_note": "<optional note if score seems inflated or engineer shows higher potential>"
}
```

---

## Validation Flow

### Step 1 — Engineer Completes Assessment
- Engineer answers all questions in the web form
- Multiple choice answers are scored automatically
- Essay answers are sent to Claude API for scoring
- Preliminary skill level is shown to the engineer immediately

### Step 2 — Squad Lead Dashboard
- Squad lead sees a summary table of all team members:
  - Engineer name
  - Multiple choice score
  - Essay scores per section
  - AI-assigned preliminary level
  - Claude's explanation and any flags
- Squad lead can: **Confirm**, **Upgrade**, or **Downgrade** each engineer's level
- Any adjustment requires a short written reason

### Step 3 — Final Level Locked
- Once squad lead validates, the final level is saved
- Engineer is notified of their confirmed skill level
- If engineer and squad lead disagree by 2+ levels, a program manager review is triggered

---

## Squad Lead Dashboard — Data Display Per Engineer

```
Engineer: [Name]
Preliminary Level: Level 2 – User
Category Recommendation: Claude Skill

Section Scores:
- Section 1 (AI Familiarity): X / 9 pts
- Section 2 (Prompting): X / 12 pts
- Section 3 (Workflow): X / 12 pts
- Section 4 (Mindset): X / 8 pts
Total: XX / 41 pts (XX%)

Claude's Summary: [2-3 sentence explanation]
Flag: [Any notes on authenticity or potential]

Squad Lead Action: [ Confirm ] [ Upgrade ] [ Downgrade ]
Reason for adjustment: [text field]
```

---

## Sample Assessment Result

Based on a sample engineer response, here is an example of expected Claude output:

```json
{
  "section2_essay": {
    "score": 6,
    "explanation": "The engineer wrote a well-structured, multi-section prompt with clearly defined output format. The explanation shows genuine understanding of why structure improves Claude's output.",
    "flag": null
  },
  "section3_essay": {
    "score": 5,
    "explanation": "The engineer identified a real, high-volume business problem and proposed a practical AI solution. The idea is strong but remains conceptual — nothing has been built yet.",
    "flag": null
  },
  "section4_essay": {
    "score": 4,
    "explanation": "The engineer acknowledges AI's potential and is honest about still being in progress. Shows genuine growth mindset but personal action steps are still developing.",
    "flag": null
  },
  "overall_level": "Level 2",
  "overall_explanation": "This engineer demonstrates solid prompting ability that is closer to Level 3 than their multiple choice answers suggest. Their business thinking is strong but hands-on AI implementation experience is still developing.",
  "category_recommendation": "Claude Skill",
  "squad_lead_note": "This engineer may be underrating themselves. The quality of the Section 2 essay suggests Level 3 potential. Consider encouraging them to attempt the Claude-Powered Tool category."
}
```

---

## Tech Stack Recommendation

| Component | Suggestion |
|-----------|------------|
| Frontend | React or simple HTML form |
| Backend | Node.js or Python |
| AI Scoring | Anthropic Claude API (claude-sonnet-4-20250514) |
| Database | Supabase or Airtable for storing responses and scores |
| Squad Lead Dashboard | Simple admin view filtered by squad |
| Notifications | Email or Slack notification when validation is needed |

---

## Key Business Rules

- Every engineer must complete the assessment before the hackathon event
- Engineers see their preliminary level immediately after submission
- Squad lead validation must be completed at least 3 days before the event
- Level 1–2 engineers are guided toward the Claude Skill category
- Level 3–4 engineers are guided toward the Claude-Powered Tool category
- Engineers who want to stretch beyond their assigned level may do so with squad lead approval
- All assessment data is used only for hackathon category placement — not for performance evaluation
