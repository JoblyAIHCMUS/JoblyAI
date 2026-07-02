export interface GenerateQuestionsRequirementInput {
  skillName: string;
  importance: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
  minYearsExperience: number | null;
}

export interface GenerateQuestionsInput {
  jobTitle: string;
  jobDescription: string;
  requirements: GenerateQuestionsRequirementInput[];
  count: number;
}

export interface GenerateQuestionsQuestionOutput {
  question: string;
  expectedAnswer: string;
}

export interface GenerateQuestionsOutput {
  questions: GenerateQuestionsQuestionOutput[];
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

  // Mix-of-question-types guidance.
  // We generate the rule from the actual count.
  const mixRule =
    input.count === 1
      ? `Make this single question a technical-skill question (testing depth in a REQUIRED skill).`
      : input.count === 2
      ? `Your 2 questions MUST include:\n- 1 technical-skill question (testing depth in a REQUIRED skill)\n- 1 scenario / behavioral question (e.g. "Describe a time when...")`
      : `Your ${
          input.count
        } questions MUST include at least:\n- 1 technical-skill question (testing depth in a REQUIRED skill)\n- 1 scenario / behavioral question (e.g. "Describe a time when...")\n- 1 motivation / values question (e.g. why this role, this company, this work)\nThe other ${
          input.count - 3
        } can be any mix.`;

  return `You are a senior recruiter at a top-tier company writing pre-shortlist screening questions for a job posting.

JOB CONTEXT
Title: ${input.jobTitle}
Description: ${input.jobDescription.slice(0, 2000)}

REQUIREMENTS
${requirementsText}

YOUR TASK
Generate exactly ${
    input.count
  } pre-shortlist questions. This is a hard requirement — the "questions" array must contain exactly ${
    input.count
  } entries, no more and no fewer. These questions will be shown to candidates who pass an automatic matching threshold, and the candidates' answers will be evaluated by another LLM to help the hiring manager decide who advances to interview.

QUALITY CRITERIA (apply to every question)
1. **Probe for evidence, not generic self-promotion.** Avoid "tell me about yourself" or "what are your strengths" — those are answered by the resume. Instead ask for a specific past situation, decision, or example.
2. **Mix of question types** — ${mixRule}
3. **Answerable in 2-5 sentences.** Don't ask questions that require a 5-paragraph essay. The LLM evaluator needs a focused answer to score.
4. **Tailor to the explicit requirements above.** A question about "Postgres" is fine only if Postgres appears in the requirements; otherwise it's noise.
5. **Don't duplicate the resume.** The candidate submits a resume separately, so don't ask for their work history in list form.
6. **Be specific and concrete.** "Describe a time you disagreed with a senior teammate about a technical decision" is good. "Are you a team player?" is bad.
7. **For each question, also draft a 1-3 sentence "expectedAnswer".** The expectedAnswer describes what a strong response would contain, anchored in the job's requirements (not generic platitudes). Keep it under 10,000 characters. The expectedAnswer will be hidden from the candidate and used as the evaluation criterion by another LLM.

OUTPUT FORMAT — strict JSON, no markdown fences, no commentary, no preamble:
{
  "questions": [
    { "question": "<single-sentence question ending with ?>", "expectedAnswer": "<1-3 sentence description of a strong response, <=10000 chars>" },
    ... (exactly ${input.count} entries)
  ]
}

The "questions" array MUST contain exactly ${
    input.count
  } objects — no more, no fewer. Each "question" must be a single sentence ending with a question mark. Each "expectedAnswer" must be 1-3 sentences of concrete substance, under 10,000 characters. No numbering, no bullet markers, no quotes inside any string.`;
}
