// apps/backend/src/app/pre-shortlist/prompts/evaluate-answers.ts

export interface EvaluateAnswersRequirementInput {
  skillName: string;
  importance: string;
  minYearsExperience: number | null;
}

export interface EvaluateAnswersQuestionInput {
  id: string;
  question: string;
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
  status: 'STRONG_FIT' | 'GOOD_FIT' | 'NEUTRAL' | 'POOR_FIT';
  score: number;
}

export interface EvaluateAnswersOverallOutput {
  comment: string;
  suggestion: 'STRONG' | 'MAYBE' | 'NO';
  overallScore: number;
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
      return `QUESTION id="${q.id}": ${q.question}\nCANDIDATE ANSWER: ${
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
For EACH question/answer pair, evaluate three dimensions and return a structured verdict:

1. **Relevance** — Does the answer actually address the question being asked? An off-topic answer should score 0 regardless of length.
2. **Specificity** — Does the answer include concrete examples, numbers, named projects, or specific situations? Vague generalities ("I am a hard worker", "I like learning new things") score low. Concrete, detailed answers score high.
3. **Alignment** — How well does the answer map to the job's requirements and seniority level? An answer that proves a skill listed as REQUIRED is worth more than one that addresses an OPTIONAL requirement.

For each question/answer, produce:
- "comment": 2-3 sentences. Be specific and professional. If useful, quote 1 short phrase from the candidate's answer. Avoid generic praise or generic criticism. Be honest about weaknesses.
- "status": one of "STRONG_FIT" (excellent, exceed expectations), "GOOD_FIT" (solid, meets expectations), "NEUTRAL" (acceptable but unremarkable or mixed signals), "POOR_FIT" (off-topic, vague, or shows misalignment).
- "score": integer 0-100. 90+ is rare, 70-85 is "good fit", 50-70 is "neutral", below 50 is "poor fit".

Then produce an OVERALL verdict:
- "comment": 1-2 sentences summarizing the candidate's overall fit for THIS specific job.
- "suggestion": one of "STRONG" (recommend advancing to interview), "MAYBE" (worth a closer look, not a clear no), "NO" (do not advance).
- "overallScore": integer 0-100.

QUALITY CRITERIA (apply to every evaluation)
- Be honest. Do not inflate scores to be polite. A vague answer to a technical question should be POOR_FIT, not GOOD_FIT.
- If the answer is too short to evaluate (less than ~2 sentences of substance), score accordingly low and note the brevity in the comment.
- Do not penalize candidates for non-native English writing; focus on substance.
- The "status" must be one of the four enum values. The "suggestion" must be one of the three values. "score" and "overallScore" must be integers.
- Evaluate each question INDEPENDENTLY first, then synthesize the overall verdict from the per-question scores.

OUTPUT FORMAT — strict JSON, no markdown fences, no commentary:
{
  "evaluations": [
    { "questionId": "<id from input>", "comment": "...", "status": "STRONG_FIT|GOOD_FIT|NEUTRAL|POOR_FIT", "score": <int 0-100> }
  ],
  "overall": { "comment": "...", "suggestion": "STRONG|MAYBE|NO", "overallScore": <int 0-100> }
}

The "evaluations" array MUST contain exactly ${numQuestions} entries, one per input question, in the same order as the input questions. Each "questionId" MUST match an id from the input.`;
}
