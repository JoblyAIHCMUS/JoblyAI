import { PrismaClient, ApplicationStatus } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { scryptAsync } from '@noble/hashes/scrypt.js';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Better-auth password hashing (Copied from seed.ts for consistency)
const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };
async function hashPassword(password: string): Promise<string> {
  const salt = Buffer.from(randomBytes(16)).toString('hex');
  const key = await scryptAsync(password.normalize('NFKC'), salt, {
    N: SCRYPT_CONFIG.N,
    p: SCRYPT_CONFIG.p,
    r: SCRYPT_CONFIG.r,
    dkLen: SCRYPT_CONFIG.dkLen,
    maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
  });
  return `${salt}:${Buffer.from(key).toString('hex')}`;
}

// Helper to add noise to a vector
function addJitter(embedding: number[], intensity: number): number[] {
  return embedding.map((v) => v + (Math.random() - 0.5) * intensity);
}

async function main() {
  console.log('🚀 Starting Mock Application Seeder...');

  // 1. Find a Job Posting that has an embedding
  // Using queryRaw with ::text cast because Prisma cannot deserialize "Unsupported" vector type directly
  const jobs: any[] = await prisma.$queryRawUnsafe(
    'SELECT id, title, embedding::text FROM "JobPosting" WHERE embedding IS NOT NULL LIMIT 1'
  );

  if (!jobs || jobs.length === 0) {
    console.error(
      '❌ No Job Posting with embedding found. Please run pnpm run seed:embeddings first.'
    );
    process.exit(1);
  }

  const job = jobs[0];
  console.log(`Using Job: "${job.title}" (ID: ${job.id})`);

  // Convert embedding to array if it's coming back as a string or special object from pgvector
  let jobEmbedding: number[];
  if (typeof job.embedding === 'string') {
    jobEmbedding = job.embedding
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map(Number);
  } else {
    jobEmbedding = job.embedding;
  }

  const hashedPassword = await hashPassword('TestPass123!');

  // 2. Create 15 Mock Candidates
  console.log('Creating 15 mock candidates and applications...');

  for (let i = 1; i <= 15; i++) {
    const timestamp = Date.now();
    const email = `mock.candidate.${timestamp}.${i}@example.com`;
    const name = `Mock Candidate ${i}`;

    // Create User
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'candidate',
      },
    });

    // Create Account for login
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: email,
        providerId: 'credential',
        password: hashedPassword,
      },
    });

    // Create Resume
    const resume = await prisma.resume.create({
      data: {
        candidateId: user.id,
        fileName: `resume_mock_${i}.pdf`,
        fileType: 'application/pdf',
        fileSize: 1024 * 500,
        parsedText: `This is a mock parsed text for candidate ${i}. They have experience in software development and matching skills.`,
        isSyncedToProfile: true,
      },
    });

    // Create Mock Embedding for Resume
    const rand = Math.random();
    const noise = rand > 0.6 ? 0.05 : rand > 0.3 ? 0.25 : 0.6;
    const mockEmb = addJitter(jobEmbedding, noise);
    const vStr = `[${mockEmb.join(',')}]`;

    await prisma.$executeRawUnsafe(
      `UPDATE "resume" SET embedding = $1::vector WHERE id = $2`,
      vStr,
      resume.id
    );

    // 3. Calculate actual similarity using SQL
    const [similarityResult]: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT 1 - (r.embedding <=> j.embedding) as similarity
      FROM "resume" r
      JOIN "JobPosting" j ON j.id = $2
      WHERE r.id = $1
    `,
      resume.id,
      job.id
    );

    const matchPercentageRaw = similarityResult?.similarity || 0;

    // 4. Create Application
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: user.id,
        resumeId: resume.id,
        status: ApplicationStatus.APPLIED,
        matchPercentage: parseFloat((matchPercentageRaw * 100).toFixed(2)),
        aiFeedback: {
          strengths: [
            'Strong match based on mock vector',
            'Good experience alignment',
          ],
          gaps:
            noise > 0.3
              ? [
                  'Missing some specific niche skills',
                  'Experience duration might be short',
                ]
              : [],
          conclusion:
            'This is a generated mock application for testing purposes.',
        },
      },
    });

    console.log(
      `  ✅ [${i}/15] Created App for ${name}: Match ${application.matchPercentage}%`
    );
  }

  console.log('\n✨ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
