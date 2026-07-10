import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { McpState } from '../../server/mcp.types';
import {
  AddPreShortlistQuestionsInputSchema,
  type AddPreShortlistQuestionsInput,
} from './employer.types';

const outputSchema = z.object({
  added: z.number().int().nonnegative(),
  questionIds: z.array(z.string()),
});

export async function addPreShortlistQuestionsHandler(
  state: McpState,
  rawInput: unknown
) {
  try {
    const input = AddPreShortlistQuestionsInputSchema.parse(
      rawInput
    ) as AddPreShortlistQuestionsInput;

    const job = await state.prisma.jobPosting.findUnique({
      where: { id: input.jobId },
      select: {
        companyId: true,
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: 'Job not found' }],
      };
    }

    if (state.companyId !== null && job.companyId !== state.companyId) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Forbidden: job does not belong to your company',
          },
        ],
      };
    }

    if (job._count.applications > 0) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: 'Cannot edit pre-shortlist questions after applications exist',
          },
        ],
      };
    }

    const existingCount = await state.prisma.preShortlistQuestion.count({
      where: { jobId: input.jobId },
    });

    if (existingCount + input.questions.length > 20) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `Maximum 20 questions per job (would be ${
              existingCount + input.questions.length
            })`,
          },
        ],
      };
    }

    await state.prisma.preShortlistQuestion.createMany({
      data: input.questions.map((q, idx) => ({
        jobId: input.jobId,
        order: existingCount + idx,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
      })),
    });

    const created = await state.prisma.preShortlistQuestion.findMany({
      where: { jobId: input.jobId, order: { gte: existingCount } },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    const result = {
      added: created.length,
      questionIds: created.map((c) => c.id),
    };
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
      structuredContent: result,
    };
  } catch (error) {
    state.logger.error(error, 'add_pre_shortlist_questions tool error');
    return {
      isError: true,
      content: [{ type: 'text' as const, text: 'Internal error' }],
    };
  }
}

export function registerAddPreShortlistQuestionsTool(
  server: McpServer,
  state: McpState
): void {
  server.registerTool(
    'add_pre_shortlist_questions',
    {
      description: `Append one or more pre-shortlist questions to a job. The agent is expected to generate the question content using its own local LLM, following the rubric and output format below. Once generated, call this tool to persist them.

---

**STEP 1 — Generate using your local LLM**

Use the rubric below as the system prompt for your LLM. Provide the job context (from \`get_job\`) as user content.

\`\`\`
You are a senior recruiter at a top-tier company writing pre-shortlist screening questions for a job posting.

JOB CONTEXT
Title: \${jobTitle}
Description: \${jobDescription.slice(0, 2000)}

REQUIREMENTS
\${requirementsText}

YOUR TASK
Generate exactly \${count} pre-shortlist questions. These questions help determine if a candidate should advance to an interview by assessing their qualifications, organizational 'fit,' and ability to clearly express potential contributions.

QUALITY CRITERIA (derived from expert interviewing standards)
1. **Mix of question types** — \${mixRule}
2. **Probe for Behavioral Evidence (S.A.R. Framework):** For scenario questions, ask for specific past situations. A strong response must follow the Situation-Action-Result framework, focusing on the candidate's specific role and what they learned.
3. **Assess Core Competencies:** Questions should target specific traits like Critical Thinking (handling ambiguity), Learning Orientation (reflecting on mistakes), and Leadership (demonstrating initiative).
4. **The 'Airport Test' (Fit & Resilience):** Include questions that gauge if the candidate is someone colleagues can work with for long periods under less-than-ideal circumstances (e.g., handling a disagreement or a team not working well).
5. **Target Technical Depth & Analysis:** For technical questions, don't just ask for a fact. Ask for the *analysis* or *approach* to a problem to see how they think.
6. **Evaluate 'Level of Interest':** Distinguish candidates by asking questions that require them to have researched the organization and the specific challenges of the role.
7. **Legality & Professionalism:** DO NOT ask about age, race, religion, gender identity, disabilities, or personal life. Focus strictly on qualifications and professional behavior.
8. **Expected Answer Anchoring:** For each 'expectedAnswer,' describe a response that 'shows rather than tells'. It should include specific actions taken and a concrete result or conclusion.

mixRule (apply based on count):
  - count === 1: 'Make this single question a technical-skill question (testing depth in a REQUIRED skill).'
  - count === 2: 'Your 2 questions MUST include: 1 technical-skill question (testing depth in a REQUIRED skill) AND 1 behavioral question targeting a core competency (e.g., Teamwork, Problem Solving, or Leadership).'
  - count >= 3: 'Your N questions MUST include at least: 1 technical-skill question (testing depth in a REQUIRED skill), 1 behavioral question using the S.A.R. (Situation, Action, Result) framework, AND 1 "fit" or "motivation" question (assessing level of interest and knowledge of the organization). The other N-3 should target different core competencies: Critical Thinking, Learning Orientation, or Professionalism.'
\`\`\`

---

**STEP 2 — Validate the LLM output**

Before calling this tool, ensure the LLM response matches this exact JSON shape:

\`\`\`json
{
  'questions': [
    {
      'question': '<scenario (optional) + single-sentence question ending with ?; 5-10000 chars>',
      'expectedAnswer': '<1-3 sentence S.A.R. description; 1-10000 chars>'
    }
  ]
}
\`\`\`

**Validation rules** (enforced by the tool's input schema):
- \`questions\` array must have at least 1 and at most 20 entries
- Each \`question\` must be 5-10000 characters
- Each \`expectedAnswer\` must be 1-10000 characters
- The total count (existing on the job + new) must not exceed 20 (enforced server-side)

The LLM is asked to generate exactly \${count} questions, so the agent should pass that many entries. The tool will not enforce a match against any expected count (there is no \`count\` field) — it just persists whatever array is sent.

If validation fails on the LLM side, regenerate with a stricter prompt before calling this tool.

---

**STEP 3 — Call this tool**

Pass the validated \`questions\` array. The tool will:
1. Verify you own the job (via \`state.companyId\`)
2. Verify the job has no applications (immutability constraint)
3. Verify the total count (existing + new) does not exceed 20
4. Persist with auto-assigned \`order\` values (existingCount + 0, +1, +2, ...)

**Common workflows:**
- *First-time setup:* \`get_job(jobId)\` → generate → \`add_pre_shortlist_questions(jobId, { questions: [...] })\`
- *Full regeneration:* \`get_pre_shortlist_questions(jobId)\` → generate → \`remove_pre_shortlist_questions(jobId, { questionIds: [all current ids] })\` → \`add_pre_shortlist_questions(jobId, { questions: [...] })\`
- *Add to existing:* \`get_pre_shortlist_questions(jobId)\` → generate delta → \`add_pre_shortlist_questions(jobId, { questions: [delta] })\`

**Returns:** \`{ added: N, questionIds: [...] }\``,
      inputSchema: AddPreShortlistQuestionsInputSchema,
      outputSchema,
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => addPreShortlistQuestionsHandler(state, args)
  );
}
