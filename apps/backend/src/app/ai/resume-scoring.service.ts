import { Injectable } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';

export interface ResumeEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  formatting: string;
  impact: string;
}

@Injectable()
export class ResumeScoringService {
  constructor(private readonly aiProvider: AiProviderService) {}

  async evaluateResume(text: string): Promise<ResumeEvaluation> {
    const prompt = `
      You are an Elite Executive Recruiter and Strategic Talent Evaluator (2026 Standard). 
      Evaluate the provided resume as a "Strategic Evidence File" rather than a mere career history.
      
      RESUME TEXT:
      ---
      ${text}
      ---

      EVALUATION FRAMEWORK (2026 Perspective):
      
      1. HIGH-SIGNAL TRIAGE (7.4s Test):
         - Does the profile immediately signal a clear target role and value proposition in the top third?
         - Is the career progression logical and evidence-based?

      2. EVIDENCE OF IMPACT ("The So What?" Factor):
         - Move beyond duties. Look for proof of making money, saving money, or saving time.
         - Evaluate replicability: Can this candidate repeat their success in a new environment?
         - Check for "lived experience" vs generic descriptions.

      3. SKILLS DENSITY & AI LITERACY:
         - Modern skill stack including AI operationalization (how they use AI to drive ROI).
         - Presence of "T-shaped" skills (depth in one area, breadth in others).
         - Links to portfolios, GitHub, or verified proof of work.

      4. READABILITY & AUTHENTICITY:
         - ATS optimization (clean layout, standard terms).
         - ANTI-ROBOT FILTER: Deduct points for overly polished, non-specific "AI-generated" fluff that lacks personal voice or specific data.

      SCORING WEIGHTS:
      - Impact & Metrics: 40%
      - Strategic Alignment & Progression: 25%
      - Skills & AI Literacy: 20%
      - Presentation & Authenticity: 15%

      RETURN FORMAT (JSON):
      {
        "score": number, // A floating point number between 0.0 and 1.0 (e.g., 0.85)
        "strengths": ["specific strategic wins found"],
        "weaknesses": ["missing metrics, generic language, or lack of role clarity"],
        "suggestions": ["actionable strategic advice to move the needle"],
        "formatting": "Feedback on triage zones and AI readability",
        "impact": "Critique of the 'So What?' factor and replicability of results"
      }
    `;

    return this.aiProvider.generateStructuredData<ResumeEvaluation>(prompt);
  }
}
