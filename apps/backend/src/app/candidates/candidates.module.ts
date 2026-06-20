import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GcsModule } from '../gcs/gcs.module';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';

@Module({
  imports: [AuthModule, GcsModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class CandidatesModule {}
