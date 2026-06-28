export interface GenerateQuestionsRequirementInput {
  skillName: string;
  importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
  minYearsExperience: number | null;
}

export interface GenerateQuestionsInput {
  jobTitle: string;
  jobDescription: string;
  requirements: GenerateQuestionsRequirementInput[];
}

export interface GenerateQuestionsOutput {
  questions: string[];
}

export function buildGenerateQuestionsPrompt(
  input: GenerateQuestionsInput
): string {
  const requirementsText =
    input.requirements
      .map(
        (r) =>
          `- ${r.skillName} (${r.importance}, ${
            r.minYearsExperience ?? 0
          } years required)`
      )
      .join('\n') || '- (no explicit requirements)';

  return `You are a senior recruiter at a top-tier company writing pre-shortlist screening questions for a job posting.

JOB CONTEXT
Title: ${input.jobTitle}
Description: ${input.jobDescription.slice(0, 2000)}

REQUIREMENTS
${requirementsText}

YOUR TASK
Generate exactly 5 pre-shortlist questions. These questions will be shown to candidates who pass an automatic matching threshold, and the candidates' answers will be evaluated by another LLM to help the hiring manager decide who advances to interview.

QUALITY CRITERIA (apply to every question)
1. **Probe for evidence, not generic self-promotion.** Avoid "tell me about yourself" or "what are your strengths" — those are answered by the resume. Instead ask for a specific past situation, decision, or example.
2. **Mix of question types** — your 5 questions MUST include at least:
   - 1 technical-skill question (testing depth in a REQUIRED skill)
   - 1 scenario / behavioral question (e.g. "Describe a time when...")
   - 1 motivation / values question (e.g. why this role, this company, this work)
   The other 2 can be any mix.
3. **Answerable in 2-5 sentences.** Don't ask questions that require a 5-paragraph essay. The LLM evaluator needs a focused answer to score.
4. **Tailor to the explicit requirements above.** A question about "Postgres" is fine only if Postgres appears in the requirements; otherwise it's noise.
5. **Don't duplicate the resume.** The candidate submits a resume separately, so don't ask for their work history in list form.
6. **Be specific and concrete.** "Describe a time you disagreed with a senior teammate about a technical decision" is good. "Are you a team player?" is bad.

OUTPUT FORMAT — strict JSON, no markdown fences, no commentary, no preamble:
{
  "questions": ["<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"]
}

Each question must be a single sentence ending with a question mark. No numbering, no bullet markers, no quotes inside the string.`;
}

export const GENERATE_QUESTIONS_PROMPT_PATH =
  'apps/web/src/features/employer/new-job/prompts/generate-questions.ts';
