import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';

@Module({
  imports: [AuthModule, S3Module],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class CandidatesModule {}
