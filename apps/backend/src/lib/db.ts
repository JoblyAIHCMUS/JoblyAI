import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Client } from 'cassandra-driver';
import Redis from 'ioredis';

// Singleton Pattern: One connection for the whole app
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
export const scylla = new Client({
  contactPoints: [process.env.CASSANDRA_CONTACT_POINT || 'localhost:9042'],
  localDataCenter: 'datacenter1',
  keyspace: 'jobly_keyspace',
});