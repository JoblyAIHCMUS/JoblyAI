import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the backend .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || !text.trim()) return [];
  try {
    // Use the same logic as AiProviderService
    const result = await genAI.models.embedContent({
      model: 'gemini-embedding-2',
      contents: [
        {
          parts: [{ text }],
          role: 'user',
        },
      ],
      config: {
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: 768,
      },
    });

    if (!result.embeddings || result.embeddings.length === 0) {
      return [];
    }

    return result.embeddings[0].values || [];
  } catch (error: any) {
    console.error(`Embedding error for text "${text.substring(0, 30)}...":`, error.message);
    return [];
  }
}

async function updateEmbedding(modelName: string, id: number | string, embedding: number[]) {
  if (embedding.length === 0) return;
  const vStr = `[${embedding.join(',')}]`;
  const idColumn = typeof id === 'string' ? '"candidateId"' : 'id';
  
  await prisma.$executeRawUnsafe(
    `UPDATE "${modelName}" SET embedding = $1::vector WHERE ${idColumn} = $2`,
    vStr,
    id
  );
}

async function processJobs() {
  console.log('Processing Job Postings...');
  // We fetch all and filter in memory to avoid Prisma type issues with Unsupported fields in 'where'
  const allJobs = await prisma.jobPosting.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      requirements: { 
        include: { 
          skill: true 
        } 
      }
    }
  });

  // Filter jobs that don't have embeddings (using any cast to access the field)
  const jobsToProcess = allJobs.filter((job: any) => !job.embedding);

  console.log(`Found ${jobsToProcess.length} jobs to embed.`);
  for (const job of jobsToProcess) {
    const skills = job.requirements.map((r: any) => r.skill.name).join(', ');
    const content = `Title: ${job.title} | Category: ${job.category?.name || ''} | Type: ${job.type} | Location: ${job.location || 'Remote'} | Description: ${job.description} | Requirements: ${skills}`;
    
    const emb = await generateEmbedding(content);
    if (emb.length > 0) {
      await updateEmbedding('JobPosting', job.id, emb);
      console.log(`  Embedded Job ID ${job.id}: ${job.title}`);
    }
  }
}

// These are kept but not called to satisfy linter/usage for now
/*
async function processCandidates() {
  console.log('Processing Candidate profiles...');
  // Logic for candidates would go here
}

async function processResumes() {
  console.log('Processing Resumes...');
  // Logic for resumes would go here
}
*/

async function main() {
  try {
    // Focused only on Jobs for now as requested
    await processJobs();
    console.log('Batch embedding for Job Postings complete!');
  } catch (error) {
    console.error('Fatal error in batch embedding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
