import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiProviderService } from '../ai-provider.service';
import { PrismaClient } from '@prisma/client';
import { AiGateway } from '../ai.gateway';
import { Logger, Inject } from '@nestjs/common';

@Processor('interview-prep')
export class InterviewPrepProcessor extends WorkerHost {
  private readonly logger = new Logger(InterviewPrepProcessor.name);

  constructor(
    private aiProvider: AiProviderService,
    @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
    private aiGateway: AiGateway
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { candidateId, jobId, resumeId } = job.data;

    try {
      this.logger.log(
        `Generating interview questions for candidate ${candidateId} and job ${jobId}`
      );

      const [jobData, resumeData] = await Promise.all([
        this.prisma.jobPosting.findUnique({
          where: { id: jobId },
          select: { title: true, description: true },
        }),
        this.prisma.resume.findUnique({
          where: { id: resumeId },
          select: { parsedText: true },
        }),
      ]);

      if (!jobData || !resumeData) {
        throw new Error('Job or Resume data not found');
      }

      const prompt = `
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

      const response = await this.aiProvider.generateStructuredData<any>(
        prompt
      );

      await this.prisma.interviewPreparation.update({
        where: { candidateId_jobId: { candidateId, jobId } },
        data: { status: 'COMPLETED', questions: response },
      });

      this.aiGateway.notifyUser(candidateId, 'INTERVIEW_PREP_READY', {
        jobId,
        questions: response,
      });

      this.logger.log(
        `Successfully generated interview questions for candidate ${candidateId} and job ${jobId}`
      );
      return response;
    } catch (error: any) {
      this.logger.error(
        `Failed to generate interview questions: ${error.message}`
      );

      await this.prisma.interviewPreparation
        .update({
          where: { candidateId_jobId: { candidateId, jobId } },
          data: { status: 'FAILED' },
        })
        .catch((err: any) =>
          this.logger.error(`Failed to update status to FAILED: ${err.message}`)
        );

      throw error;
    }
  }
}
