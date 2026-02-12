import { Inject } from '@nestjs/common';

export const InjectPrisma = () => Inject('PRISMA_CLIENT');
export const InjectRedis = () => Inject('REDIS_CLIENT');
export const InjectScylla = () => Inject('SCYLLA_CLIENT');
