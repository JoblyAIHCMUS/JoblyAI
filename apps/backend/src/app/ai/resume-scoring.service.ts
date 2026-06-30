import { Injectable } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';

export interface AuditDetail {
  status: 'excellent' | 'needs_improvement' | 'critical';
  ruleName: string;
  ruleSource: string;
  critique: string;
  brokenRulesExplanation: string;
}

export interface DetailedStrength {
  title: string;
  description: string;
  evidence: string;
}

export interface DetailedWeakness {
  title: string;
  description: string;
  ruleBroken: string;
  evidence: string;
}

export interface RewriteSuggestion {
  originalText: string;
  suggestedText: string;
  ruleApplied: string;
  explanation: string;
}

export interface ResumeEvaluation {
  score: number; // Keep for backend DB structure, set to 0
  strengths: string[]; // Keep for backwards compatibility
  weaknesses: string[]; // Keep for backwards compatibility
  suggestions: string[]; // Keep for backwards compatibility
  formatting: string;
  impact: string;
  
  // Expanded fields for explanation based on rules
  auditReport: {
    impact: AuditDetail;
    language: AuditDetail;
  };
  detailedStrengths?: DetailedStrength[];
  detailedWeaknesses?: DetailedWeakness[];
  rewriteSuggestions?: RewriteSuggestion[];
  generalAdvice?: string;
}

@Injectable()
export class ResumeScoringService {
  constructor(private readonly aiProvider: AiProviderService) {}

  async evaluateResume(text: string): Promise<ResumeEvaluation> {
    const systemInstruction = `
      You are an Elite AI Resume Auditor operating at the standards of top-tier executive recruiters (Silicon Valley and Fortune 500 HR guidelines).
      Your job is to perform a rigorous, highly detailed qualitative audit of the provided candidate resume text.
      You must evaluate the resume strictly against two globally recognized content-based resume-writing frameworks.
      Do not calculate or assign numerical scores. Keep the "score" field set to 0.

      Below are the detailed rules and criteria you must apply for each framework:

      ================================================================================
      1. GOOGLE XYZ FORMULA (Focus: Metric-driven Impact & Quantitative Outcomes)
      ================================================================================
      - Core Rule: Every achievement or experience statement (the sentences describing achievements in their roles) should follow the formula: 
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
      2. HARVARD BUSINESS SCHOOL (HBS) ACTION VERBS GUIDE (Focus: Active Tone & Powerful Vocabulary)
      ================================================================================
      - Core Rule: Every single experience statement must start with a powerful, active, impact-oriented verb in the correct tense (past tense for completed roles, present tense for current roles).
      - Forbidden Weak/Passive Words: 
        * "Responsible for..." (tells duties, not achievements)
        * "Helped to..." / "Assisted with..." (dilutes ownership)
        * "Worked on..." / "Handled..." / "Did..." (weak, generic effort)
        * "Participated in..." / "Involved in..." (implies passive observation)
      - Recommended Action Verbs list:
        * Leadership/Management: Spearheaded, Orchestrated, Directed, Pioneered, Steered, Executed.
        * Technical/Creation: Engineered, Architected, Devised, Developed, Formulated, Programmed.
        * Improvement/Savings: Optimized, Streamlined, Restructured, Overhauled, Trimmed, Consolidated.
      - Clichés & Buzzwords to Flag: "Team player", "Out-of-the-box thinker", "Synergistic leader", "Self-starter". Deduct qualitative status points for these.

      ================================================================================
      INSTRUCTIONS FOR ANALYSIS:
      ================================================================================
      - Evaluate the resume text against the two sections above.
      - Assign a status ('excellent', 'needs_improvement', 'critical') for each category based on rule adherence. Do not calculate or assign numerical scores.
      - For "critique", write a comprehensive, professional HR assessment (2-4 sentences) outlining exactly what they did well and what is lacking.
      - For "brokenRulesExplanation", specify the exact reasons they failed or succeeded, citing evidence. (e.g., "Violates Harvard Guide: Found 3 experience statements starting with the weak phrase 'Responsible for' (under TechSolutions roles).")
      - Provide 2 to 4 concrete, contextual "Rewrite Suggestions" for weak sentences found in their resume.
        * For each rewrite, write the "originalText", a high-impact "suggestedText" written in the XYZ format with realistic placeholder metrics (e.g., "[X]% latency", "$[Y] budget"), the "ruleApplied" (e.g., "Google XYZ Formula"), and an "explanation" detailing exactly why the replacement is superior.
        * Important: Write the suggestions and rewrites in the same language as the resume (e.g., if the CV is in Vietnamese, write the rewrites in Vietnamese; if in English, write in English).
      - Populate the backward-compatible strings/arrays (strengths, weaknesses, suggestions, formatting, impact).
      - Keep the "score" field set to 0.

      RETURN FORMAT (JSON):
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
          {
            "title": "Short descriptive title of strength",
            "description": "Elaborate on how this helps the candidate.",
            "evidence": "Direct quote from resume text"
          }
        ],
        "detailedWeaknesses": [
          {
            "title": "Short descriptive title of weakness",
            "description": "Elaborate on what is wrong and how to fix it.",
            "ruleBroken": "Name of the rule (e.g., Harvard Action Verbs)",
            "evidence": "Direct quote from resume text"
          }
        ],
        "rewriteSuggestions": [
          {
            "originalText": "Original weak phrase",
            "suggestedText": "New XYZ-formatted rewrite suggestion",
            "ruleApplied": "Applied rules",
            "explanation": "Why this suggestion is better."
          }
        ],
        "generalAdvice": "A summary advice paragraph pointing out the single most important action the candidate should take next to elevate their resume."
      }
    `;

    const userPrompt = `
      Please perform a qualitative CV audit on the following candidate resume text:
      ---
      ${text}
      ---
    `;

    return this.aiProvider.generateStructuredDataWithCache<ResumeEvaluation>(
      userPrompt,
      systemInstruction,
      'resume_qualitative_audit_rules'
    );
  }
}

