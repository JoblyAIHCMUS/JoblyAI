import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Client } from 'cassandra-driver';
import Redis from 'ioredis';

// Singleton Pattern: One connection for the whole app
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
export const redis = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379'
);

const scyllaHost = process.env.SCYLLA_HOST || 'localhost';
const scyllaPort = process.env.SCYLLA_PORT || '9042';
const scyllaContactPoint =
  process.env.CASSANDRA_CONTACT_POINT || `${scyllaHost}:${scyllaPort}`;

const scyllaUser = process.env.SCYLLA_USER;
const scyllaPassword = process.env.SCYLLA_PASSWORD;

export const scylla = new Client({
  contactPoints: [scyllaContactPoint],
  localDataCenter: process.env.SCYLLA_DATACENTER || 'datacenter1',
  keyspace: process.env.SCYLLA_KEYSPACE || 'chat_app',
  ...(scyllaUser && scyllaPassword
    ? { credentials: { username: scyllaUser, password: scyllaPassword } }
    : {}),
});

