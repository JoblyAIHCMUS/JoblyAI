import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma'
import Redis from 'ioredis';

// Singleton Pattern: One connection for the whole app
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');