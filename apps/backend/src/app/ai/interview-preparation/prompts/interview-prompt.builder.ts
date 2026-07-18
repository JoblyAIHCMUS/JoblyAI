import { Injectable } from '@nestjs/common';
import { InterviewContext } from '../application/interview-context.model.js';

@Injectable()
export class InterviewPromptBuilder {
  build(context: InterviewContext): string {
    return `
You are an expert Interviewer and Senior Hiring Manager at a top-tier company.
Your task is to generate a personalized interview preparation kit for a candidate by analyzing their profile against the job requirements.

Context Details:
- Job Title: ${context.role ?? 'N/A'}
- Seniority Level: ${context.level ?? 'N/A'}
- Company: ${context.company ?? 'N/A'}
- Must-have Competencies: ${context.mustHaveCompetencies.join(', ')}
- Nice-to-have Competencies: ${context.niceToHaveCompetencies.join(', ')}
- Job Success Metrics (KPIs): ${context.successMetrics.join(' | ')}

Candidate Profile:
- Total Experience: ${context.candidateExperienceYears} years
- Candidate Skills: ${context.candidateSkills.join(', ')}
- Candidate Strengths: ${context.candidateStrengths.join(' | ')}
- Identified Gaps (Required skills not found or weak in the candidate's CV): ${context.gaps.join(', ')}

Based on the Job Description and the Candidate's Resume, generate exactly 4 personalized interview questions:
1. Focus on the candidate's Gaps: Ask situational/problem-solving questions probing how they would handle tasks requiring these missing skills or how they plan to bridge them.
2. Probe Strengths: Create a challenging question that tests their stated core strengths in a highly technical or leadership scenario matching the job level.
3. Test Transferable Skills: Ask questions that check if their experience is transferable to the Job Success Metrics (KPIs) of this new role.

Classify the difficulty of each question strictly based on Bloom's Taxonomy:
- "Easy": Remember & Understand (conceptual recall, introductory behavioral questions).
- "Medium": Apply & Analyze (situational scenarios, technical tasks, analysis).
- "Hard": Evaluate & Create (system architecture design, risk assessment, strategic decision-making).

For each question, provide:
- question: The text of the interview question.
- category: The category or topic of the question (e.g. Technical, Behavioral, Situational).
- difficulty: The difficulty level (must be exactly "Easy", "Medium", or "Hard").
- relevance: Detailed explanation of why this question is relevant to the candidate's profile vs job requirements.
- confidence: A confidence score between 0.0 and 1.0.
- sampleAnswer: A model answer that the candidate should strive for.
- interviewerIntent: The psychological or professional reason why an interviewer asks this question.
- tips: Practical advice on how to structure the answer.
- origin: Must be exactly "ai_generated".
- reasoning: Detailed explanation of why this question was generated based on the gap analysis.
- sources: Must be an empty array [].

Constraints:
- Language: Strictly English.
- Output Format: Return ONLY a valid JSON array matching the schema:
[
  {
    "question": "...",
    "category": "...",
    "difficulty": "Easy" | "Medium" | "Hard",
    "relevance": "...",
    "confidence": 0.9,
    "sampleAnswer": "...",
    "interviewerIntent": "...",
    "tips": "...",
    "origin": "ai_generated",
    "reasoning": "...",
    "sources": []
  }
]
    `.trim();
  }
}
