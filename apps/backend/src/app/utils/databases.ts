import { pool, adapter, prisma, redis, scylla } from '../../lib/db';
import { Global, Logger, Module } from '@nestjs/common';

const isScyllaEnabled = !['false', '0', 'off', 'no'].includes(
  String(process.env.SCYLLA_ENABLED ?? 'true').toLowerCase()
);

const disabledScyllaClient = {
  async connect() {
    Logger.warn(
      'ScyllaDB is disabled. Message/chat features that use ScyllaDB will be unavailable.',
      'DatabaseModule'
    );
  },
  async execute() {
    throw new Error(
      'ScyllaDB is disabled. Set SCYLLA_ENABLED=true and configure SCYLLA_HOST to enable message/chat features.'
    );
  },
};

export const DatabaseProviders = [
  {
    provide: 'PG_POOL',
    useValue: pool,
    useFactory: async () => {
      // If any async setup is needed, do it here
      return pool;
    },
  },
  {
    provide: 'PRISMA_ADAPTER',
    useValue: adapter,
    useFactory: async () => {
      // If any async setup is needed, do it here
      return adapter;
    },
  },
  {
    provide: 'PRISMA_CLIENT',
    useValue: prisma,
    useFactory: async () => {
      await prisma.$connect();
      return prisma;
    },
  },
  {
    provide: 'REDIS_CLIENT',
    useValue: redis,
    useFactory: async () => {
      await redis.connect();
      return redis;
    },
  },
  {
    provide: 'SCYLLA_CLIENT',
    useFactory: async () => {
      if (!isScyllaEnabled) {
        await disabledScyllaClient.connect();
        return disabledScyllaClient;
      }

      await scylla.connect();
      return scylla;
    },
  },
];

@Global()
@Module({
  providers: [...DatabaseProviders],
  exports: [...DatabaseProviders],
})
export class DatabaseModule {}
