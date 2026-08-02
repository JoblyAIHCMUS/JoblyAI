import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GcsModule } from '../gcs/gcs.module';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { LocationModule } from '../location/location.module';
import { PdfExporterService } from './pdf-exporter.service';

@Module({
  imports: [AuthModule, GcsModule, LocationModule],
  controllers: [CandidatesController],
  providers: [CandidatesService, PdfExporterService],
  exports: [PdfExporterService],
})
export class CandidatesModule {}
