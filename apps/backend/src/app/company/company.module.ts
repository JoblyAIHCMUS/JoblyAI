import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GcsModule } from '../gcs/gcs.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [AuthModule, GcsModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
