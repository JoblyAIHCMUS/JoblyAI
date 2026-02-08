import {pool, adapter, prisma, redis, scylla} from '../../lib/db';
import { Global, Module } from '@nestjs/common';

export const DatabaseProviders = [
  {
    provide: 'PG_POOL',
    useValue: pool,
    useFactory: async () => {
      // If any async setup is needed, do it here
      return pool;
    }
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
    useValue: scylla,
    useFactory: async () => {
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