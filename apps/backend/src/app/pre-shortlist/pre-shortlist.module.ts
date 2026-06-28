import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PreShortlistService } from './pre-shortlist.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'pre-shortlist-evaluation' })],
  providers: [PreShortlistService],
  exports: [PreShortlistService],
})
export class PreShortlistModule {}
