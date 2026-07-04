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
      const expected =
        q.expectedAnswer && q.expectedAnswer.trim().length > 0
          ? q.expectedAnswer
          : '(none provided — evaluate against general role fit and note the absence of a criterion in the comment)';
      return `QUESTION id="${q.id}": ${
        q.question
      }\nEXPECTED ANSWER: ${expected}\nCANDIDATE ANSWER: ${
        ans?.answer ?? '(no answer provided)'
      }`;
    })
    .join('\n\n');

  const numQuestions = input.questions.length;

  return `You are a senior hiring manager at a top-tier company evaluating a candidate's pre-shortlist answers. You will apply the principles of **Structured Interviewing** to ensure accuracy, consistency, and legal defensibility.

ROLE CONTEXT
Job Title: ${input.jobTitle}
Job Description (excerpt): ${input.jobDescription.slice(0, 2000)}

REQUIREMENTS
${requirementsText}

CANDIDATE'S ANSWERS
${questionsAndAnswersText}

YOUR TASK
For EACH question/answer pair, evaluate the response by comparing the "CANDIDATE ANSWER" against the "EXPECTED ANSWER." You must determine the candidate's **proficiency level** based on the evidence provided in their response.

For each question/answer, produce:
- "comment": 1-3 sentences providing an **evidence-based evaluation**. Your comment must be defensible and supported by specific behavioral examples from the candidate's answer. Explicitly note if the candidate provided "Superior" details (probing deeper into a problem), "Satisfactory" details (meeting the basic requirement), or "Unsatisfactory" details (failing to address the core issue). If no expected answer was provided, state: "No expected answer was provided by the employer," then evaluate based on the general competency required for the role.

Then produce an OVERALL verdict:
- "comment": 1-2 sentences summarizing the candidate's overall fit. This must be a synthesis of their demonstrated competencies across all questions.
- "suggestion": one of "STRONG" (highly recommended), "MAYBE" (recommended with reservations), "NO" (not recommended).

QUALITY CRITERIA (OPM Structured Interview Standards)
1. **Avoid Rating Errors:** Do not allow the **Halo Effect** (letting one strong answer inflate others) or **Central Tendency** (rating everything as "Maybe" to be safe) to influence your verdict.
2. **Resist Contrast Effects:** Evaluate this candidate strictly against the job requirements and expected answers, not in comparison to other hypothetical candidates.
3. **Evidence over First Impressions:** Do not make a rapid decision based on the first sentence. Gather all behavioral evidence from the full response before concluding.
4. **Behavioral Consistency:** The best predictor of future behavior is past behavior. Look for specific "Actions" the candidate took and the "Outcomes" achieved.
5. **Focus on Substance:** Focus on the "accuracy and relevance of information" and the "soundness of judgment" rather than writing style or non-native English markers.

OUTPUT FORMAT — strict JSON, no markdown fences, no commentary:
{
  "evaluations": [
    { "questionId": "<id from input>", "comment": "..." }
  ],
  "overall": { "comment": "...", "suggestion": "STRONG|MAYBE|NO" }
}

The "evaluations" array MUST contain exactly ${numQuestions} entries. The output JSON must contain ONLY the fields shown above.`;
}
