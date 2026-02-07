import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { prisma } from '../../lib/db';

@Global() // Make PrismaService globally available. Basically a singleton
@Module({
  providers: [
    {
      provide: PrismaClient, // Use PrismaClient as the injection token, the name to identify the provider
      useValue: prisma, // Actual instance to be injected
    },
  ],
  exports: [PrismaClient], // Allow other modules to use this provider
})
export class PrismaModule {}