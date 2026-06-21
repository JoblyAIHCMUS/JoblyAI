import { Module } from '@nestjs/common';
import { GcsController } from './gcs.controller';
import { GcsService } from './gcs.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GcsController],
  providers: [GcsService],
  exports: [GcsService],
})
export class GcsModule {}
