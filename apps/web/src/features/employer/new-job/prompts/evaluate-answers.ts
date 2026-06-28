// apps/backend/src/app/pre-shortlist/prompts/evaluate-answers.ts

export interface EvaluateAnswersRequirementInput {
  skillName: string;
  importance: string;
  minYearsExperience: number | null;
}

export interface EvaluateAnswersQuestionInput {
  id: string;
  question: string;
  expectedAnswer: string | null;
}

export interface EvaluateAnswersAnswerInput {
  questionId: string;
  answer: string;
}

export interface EvaluateAnswersInput {
  jobTitle: string;
  jobDescription: string;
  requirements: EvaluateAnswersRequirementInput[];
  questions: EvaluateAnswersQuestionInput[];
  answers: EvaluateAnswersAnswerInput[];
}

export interface EvaluateAnswersEvaluationOutput {
  questionId: string;
  comment: string;
}

export interface EvaluateAnswersOverallOutput {
  comment: string;
  suggestion: 'STRONG' | 'MAYBE' | 'NO';
}

export interface EvaluateAnswersOutput {
  evaluations: EvaluateAnswersEvaluationOutput[];
  overall: EvaluateAnswersOverallOutput;
}

export function buildEvaluateAnswersPrompt(
  input: EvaluateAnswersInput
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

  const questionsAndAnswersText = input.questions
    .map((q) => {
      const ans = input.answers.find((a) => a.questionId === q.id);
      const expected = q.expectedAnswer && q.expectedAnswer.trim().length > 0
        ? q.expectedAnswer
        : '(none provided — evaluate against general role fit and note the absence of a criterion in the comment)';
      return `QUESTION id="${q.id}": ${q.question}\nEXPECTED ANSWER: ${expected}\nCANDIDATE ANSWER: ${
        ans?.answer ?? '(no answer provided)'
      }`;
    })
    .join('\n\n');

  const numQuestions = input.questions.length;

  return `You are a senior hiring manager at a top-tier company evaluating a candidate's pre-shortlist answers for a role.

ROLE CONTEXT
Job Title: ${input.jobTitle}
Job Description (excerpt): ${input.jobDescription.slice(0, 2000)}

REQUIREMENTS
${requirementsText}

CANDIDATE'S ANSWERS
${questionsAndAnswersText}

YOUR TASK
For EACH question/answer pair, evaluate against the question's EXPECTED ANSWER (which represents the criterion the hiring manager supplied) and return a structured verdict.

For each question/answer, produce:
- "comment": 1-3 sentences that compare the candidate's answer against the expected answer. Be specific and professional. If useful, quote 1 short phrase from the candidate's answer. If no expected answer was supplied for this question, say so explicitly in the comment (e.g. "No expected answer was provided by the employer.") and then evaluate against general role fit. Avoid generic praise or generic criticism. Be honest about weaknesses. Do NOT emit a numeric score or a categorical status label — only the comment.

Then produce an OVERALL verdict:
- "comment": 1-2 sentences summarizing the candidate's overall fit for THIS specific job.
- "suggestion": one of "STRONG" (recommend advancing to interview), "MAYBE" (worth a closer look, not a clear no), "NO" (do not advance). Do NOT emit an "overallScore" — only the suggestion.

QUALITY CRITERIA (apply to every evaluation)
- Be honest. Do not inflate feedback to be polite. A vague answer to a technical question should be called out clearly, not glossed over.
- If the answer is too short to evaluate (less than ~2 sentences of substance), note the brevity in the comment.
- Do not penalize candidates for non-native English writing; focus on substance.
- The "suggestion" must be one of the three enum values. Each "comment" must be a non-empty string.
- When the expected answer is absent, your comment must say so explicitly and then proceed with the general fit evaluation.
- Evaluate each question INDEPENDENTLY first, then synthesize the overall verdict from the per-question comments.

OUTPUT FORMAT — strict JSON, no markdown fences, no commentary:
{
  "evaluations": [
    { "questionId": "<id from input>", "comment": "..." }
  ],
  "overall": { "comment": "...", "suggestion": "STRONG|MAYBE|NO" }
}

The "evaluations" array MUST contain exactly ${numQuestions} entries, one per input question, in the same order as the input questions. Each "questionId" MUST match an id from the input. Do NOT include any "score", "status", or "overallScore" field anywhere.`;
}

export const EVALUATE_ANSWERS_PROMPT_PATH =
  'apps/web/src/features/employer/new-job/prompts/evaluate-answers.ts';
