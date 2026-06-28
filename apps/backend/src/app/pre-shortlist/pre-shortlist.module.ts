import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PreShortlistService } from './pre-shortlist.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    AiModule,
    BullModule.registerQueue({ name: 'pre-shortlist-evaluation' }),
  ],
  providers: [PreShortlistService],
  exports: [PreShortlistService],
})
export class PreShortlistModule {}
