import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class InterviewPrepService {
  constructor(
    @Inject('PRISMA_CLIENT') private prisma: PrismaClient,
    @InjectQueue('interview-prep') private prepQueue: Queue
  ) {}

  async getOrCreatePrep(candidateId: string, jobId: number) {
    // Check if application exists
    const application = await this.prisma.application.findFirst({
      where: { candidateId, jobId },
    });

    if (!application) {
      throw new Error('Candidate must apply to the job first.');
    }

    let prep = await this.prisma.interviewPreparation.findUnique({
      where: { candidateId_jobId: { candidateId, jobId } },
    });

    if (!prep) {
      prep = await this.prisma.interviewPreparation.create({
        data: { candidateId, jobId, status: 'PENDING' },
      });
      await this.prepQueue.add('generate-questions', {
        candidateId,
        jobId,
        resumeId: application.resumeId,
      });
    }

    return prep;
  }

  async regeneratePrep(candidateId: string, jobId: number) {
    const application = await this.prisma.application.findFirst({
      where: { candidateId, jobId },
    });

    if (!application) throw new Error('Application not found');

    const prep = await this.prisma.interviewPreparation.update({
      where: { candidateId_jobId: { candidateId, jobId } },
      data: { status: 'PENDING', questions: Prisma.DbNull },
    });

    await this.prepQueue.add('generate-questions', {
      candidateId,
      jobId,
      resumeId: application.resumeId,
    });
    return prep;
  }
}
