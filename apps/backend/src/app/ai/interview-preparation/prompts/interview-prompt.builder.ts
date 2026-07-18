import { Injectable } from '@nestjs/common';

@Injectable()
export class InterviewPromptBuilder {
  build(
    jobData: { title: string; description: string },
    resumeData: { parsedText: string | null }
  ): string {
    return `
        You are an expert Interviewer and Senior Hiring Manager at a top-tier company.
        Your task is to generate a comprehensive interview preparation kit for a candidate.
        
        Job Title: ${jobData.title}
        Job Description: ${jobData.description}
        
        Candidate's Submitted Resume:
        ${resumeData.parsedText}
        
        Based on the Job Description and the Candidate's Resume, generate 9 interview questions divided into three difficulty levels:
        
        1. "easy": Behavioral and introductory questions based on their profile.
        2. "medium": Situational and skill-based questions that link their experience to the job requirements.
        3. "hard": Challenging questions focusing on problem-solving, critical thinking, or addressing potential gaps/misalignments between their background and the job.
        
        For each question, provide:
        - "question": The question text.
        - "sampleAnswer": A model answer that the candidate should strive for.
        - "interviewerIntent": The psychological or professional reason why an interviewer asks this question.
        - "tips": Practical advice on how to structure the answer or what keywords/actions to highlight.
        
        Constraints:
        - Language: Strictly English.
        - Output Format: Return ONLY a valid JSON object.
        
        JSON Structure:
        {
          "easy": [{"question": "", "sampleAnswer": "", "interviewerIntent": "", "tips": ""}],
          "medium": [...],
          "hard": [...]
        }
      `;
  }
}
