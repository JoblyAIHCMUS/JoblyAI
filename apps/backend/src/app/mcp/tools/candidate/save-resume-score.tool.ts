import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  SaveResumeScoreInputSchema,
  type SaveResumeScoreInput,
} from './candidate.types';

export async function saveResumeScoreHandler(
  state: McpState,
  input: SaveResumeScoreInput
) {
  try {
    const resume = await state.prisma.resume.findUnique({
      where: { id: input.resumeId },
    });
    if (!resume) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Resume not found' }],
      };
    }
    if (resume.candidateId !== state.userId) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Access denied' }],
      };
    }

    await state.prisma.resume.update({
      where: { id: input.resumeId },
      data: {
        aiScore: input.score,
        aiFeedback: input.feedback as any,
      },
    });

    const result = { success: true as const };
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'save_resume_score tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerSaveResumeScoreTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'save_resume_score',
    {
      description: `Persist agent-computed resume quality score + qualitative feedback. Step 4b of the upload flow. No recalc needed — calculateExplanation does not read aiScore/aiFeedback.

Before calling this tool, audit the raw resume text using these rigorous scoring criteria:

================================================================================
1. GOOGLE XYZ FORMULA (Focus: Metric-driven Impact & Quantitative Outcomes)
================================================================================
- Core Rule: Every achievement/experience statement should follow:
  "Accomplished [X] as measured by [Y], by doing [Z]"
  * X (Accomplished): What was the goal, project, or deliverable?
  * Y (Measured by): What was the quantitative impact? (e.g., %, $, time saved, uptime, queries/sec, ticket volume).
  * Z (By doing): What actions, methodologies, or technologies were used?
- Triage & Checklist:
  * Analyze the sentences describing work experience.
  * Count how many of these statements contain a verified number, percentage, currency, or time metric.
  * If a statement reads like a passive list of duties (e.g., "Maintained code", "Wrote unit tests"), it is a FAIL.
- Forbidden Phrasing: Generic statements of effort without outcomes (e.g., "Responsible for coding features", "Worked on bug fixes").

================================================================================
2. HARVARD HBS ACTION VERBS GUIDE (Focus: Active Tone & Powerful Vocabulary)
================================================================================
- Core Rule: Every single experience statement must start with a powerful, active, impact-oriented verb in the correct tense (past tense for completed roles, present tense for current roles).
- Forbidden Weak/Passive Words:
  * "Responsible for..." (tells duties, not achievements)
  * "Helped to..." / "Assisted with..." (dilutes ownership)
  * "Worked on..." / "Handled..." / "Did..." (weak, generic effort)
  * "Participated in..." / "Involved in..." (implies passive observation)
- Recommended Action Verbs:
  * Leadership/Management: Spearheaded, Orchestrated, Directed, Pioneered, Steered, Executed.
  * Technical/Creation: Engineered, Architected, Devised, Developed, Formulated, Programmed.
  * Improvement/Savings: Optimized, Streamlined, Restructured, Overhauled, Trimmed, Consolidated.
- Clichés & Buzzwords to Flag: "Team player", "Out-of-the-box thinker", "Synergistic leader", "Self-starter". Deduct qualitative status points for these.

================================================================================
INSTRUCTIONS FOR ANALYSIS:
================================================================================
- Evaluate the resume text against the two frameworks above.
- Assign a status ('excellent', 'needs_improvement', 'critical') for each category based on rule adherence. Do NOT calculate or assign numerical scores — set "score" to 0.
- For "critique", write a comprehensive, professional HR assessment (2-4 sentences) outlining exactly what they did well and what is lacking.
- For "brokenRulesExplanation", specify the exact reasons they failed or succeeded, citing evidence. (e.g., "Violates Harvard Guide: Found 3 experience statements starting with the weak phrase 'Responsible for' (under TechSolutions roles).")
- Provide 2 to 4 concrete, contextual "Rewrite Suggestions" for weak sentences found in their resume.
  * For each rewrite, write the "originalText", a high-impact "suggestedText" written in the XYZ format with realistic placeholder metrics (e.g., "[X]% latency", "$[Y] budget"), the "ruleApplied" (e.g., "Google XYZ Formula"), and an "explanation" detailing exactly why the replacement is superior.
  * Important: Write the suggestions and rewrites in the same language as the resume (e.g., if the CV is in Vietnamese, write the rewrites in Vietnamese; if in English, write in English).
- Populate the backward-compatible strings/arrays (strengths, weaknesses, suggestions, formatting, impact).
- Keep the "score" field set to 0.

Pass the evaluation result as the "feedback" field matching this structure:
{
  "score": 0,
  "strengths": ["string summarizing strength 1", "string summarizing strength 2"],
  "weaknesses": ["string summarizing weakness 1", "string summarizing weakness 2"],
  "suggestions": ["string summarizing suggestion 1", "string summarizing suggestion 2"],
  "formatting": "Detailed paragraph assessing scannability and structural section headers",
  "impact": "Detailed paragraph assessing metric density and accomplishment phrasing",
  "auditReport": {
    "impact": {
      "status": "excellent" | "needs_improvement" | "critical",
      "ruleName": "Google XYZ Formula",
      "ruleSource": "Google Careers Guide",
      "critique": "Detailed critique of quantitative metrics and outcomes in their achievements.",
      "brokenRulesExplanation": "Specific violations/successes (e.g., Only 15% of experience statements contain measurable results. For instance, the statement 'wrote test scripts' lacks any metric indicating test coverage or time saved.)"
    },
    "language": {
      "status": "excellent" | "needs_improvement" | "critical",
      "ruleName": "Harvard HBS Action Verbs Guide",
      "ruleSource": "Harvard Business School Career Development Office",
      "critique": "Critique of verb strength, active voice, and buzzword usage.",
      "brokenRulesExplanation": "Specific violations (e.g., Multiple experience statements start with weak passive phrases like 'worked on database maintenance' and 'helped write specs' instead of strong verbs like 'engineered' or 'formulated'.)"
    }
  },
  "detailedStrengths": [
    { "title": "Short descriptive title of strength", "description": "Elaborate on how this helps the candidate.", "evidence": "Direct quote from resume text" }
  ],
  "detailedWeaknesses": [
    { "title": "Short descriptive title of weakness", "description": "Elaborate on what is wrong and how to fix it.", "ruleBroken": "Name of the rule (e.g., Harvard Action Verbs)", "evidence": "Direct quote from resume text" }
  ],
  "rewriteSuggestions": [
    { "originalText": "Original weak phrase", "suggestedText": "New XYZ-formatted rewrite suggestion", "ruleApplied": "Applied rules", "explanation": "Why this suggestion is better." }
  ],
  "generalAdvice": "A summary advice paragraph pointing out the single most important action the candidate should take next to elevate their resume."
}`,
      inputSchema: SaveResumeScoreInputSchema,
      outputSchema: z.object({ success: z.literal(true) }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) =>
      saveResumeScoreHandler(state, args as SaveResumeScoreInput)
  );
}
