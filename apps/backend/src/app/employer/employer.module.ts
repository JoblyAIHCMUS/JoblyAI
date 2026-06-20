import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GcsModule } from '../gcs/gcs.module';
import { UserModule } from '../user/user.module';
import { EmployerService } from './employer.service';
import { EmployerController } from './employer.controller';

@Module({
  imports: [AuthModule, GcsModule, UserModule],
  controllers: [EmployerController],
  providers: [EmployerService],
  exports: [EmployerService],
})
export class EmployerModule {}
