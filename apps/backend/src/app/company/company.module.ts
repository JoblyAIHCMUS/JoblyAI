import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GcsModule } from '../gcs/gcs.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [AuthModule, GcsModule, LocationModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
