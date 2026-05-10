import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [AuthModule, S3Module],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
