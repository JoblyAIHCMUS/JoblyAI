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

  // Refined using the 8 core competencies identified in Harvard's guide.
  const mixRule =
    input.count === 1
      ? `Make this single question a technical-skill question (testing depth in a REQUIRED skill).`
      : input.count === 2
      ? `Your 2 questions MUST include:\n- 1 technical-skill question (testing depth in a REQUIRED skill)\n- 1 behavioral question targeting a core competency (e.g., Teamwork, Problem Solving, or Leadership).`
      : `Your ${
          input.count
        } questions MUST include at least:\n- 1 technical-skill question (testing depth in a REQUIRED skill)\n- 1 behavioral question using the S.A.R. (Situation, Action, Result) framework\n- 1 "fit" or "motivation" question (assessing level of interest and knowledge of the organization)\nThe other ${
          input.count - 3
        } should target different core competencies: Critical Thinking, Learning Orientation, or Professionalism.`;

  return `You are a senior recruiter at a top-tier company writing pre-shortlist screening questions for a job posting.

JOB CONTEXT
Title: ${input.jobTitle}
Description: ${input.jobDescription.slice(0, 2000)}

REQUIREMENTS
${requirementsText}

YOUR TASK
Generate exactly ${
    input.count
  } pre-shortlist questions. These questions help determine if a candidate should advance to an interview by assessing their qualifications, organizational "fit," and ability to clearly express potential contributions.

QUALITY CRITERIA (derived from expert interviewing standards)
1. **Mix of question types** — ${mixRule}
2. **Probe for Behavioral Evidence (S.A.R. Framework):** For scenario questions, ask for specific past situations. A strong response must follow the Situation-Action-Result framework, focusing on the candidate's specific role and what they learned.
3. **Assess Core Competencies:** Questions should target specific traits like Critical Thinking (handling ambiguity), Learning Orientation (reflecting on mistakes), and Leadership (demonstrating initiative).
4. **The "Airport Test" (Fit & Resilience):** Include questions that gauge if the candidate is someone colleagues can work with for long periods under less-than-ideal circumstances (e.g., handling a disagreement or a team not working well).
5. **Target Technical Depth & Analysis:** For technical questions, don't just ask for a fact. Ask for the *analysis* or *approach* to a problem to see how they think.
6. **Evaluate "Level of Interest":** Distinguish candidates by asking questions that require them to have researched the organization and the specific challenges of the role.
7. **Legality & Professionalism:** DO NOT ask about age, race, religion, gender identity, disabilities, or personal life. Focus strictly on qualifications and professional behavior.
8. **Expected Answer Anchoring:** For each "expectedAnswer," describe a response that "shows rather than tells". It should include specific actions taken and a concrete result or conclusion.

OUTPUT FORMAT — strict JSON, no markdown fences, no commentary, no preamble:
{
  "questions": [
    { 
      "question": "<scenario description (optional), followed by a single-sentence question ending with ?, <=10000 chars>", 
      "expectedAnswer": "<1-3 sentence description of a strong response using S.A.R. and relevant competencies, <=10000 chars>" 
    },
    ... (exactly ${input.count} entries)
  ]
}

The "questions" array MUST contain exactly ${
    input.count
  } objects. No numbering, no bullet markers, no quotes inside any string.`;
}
