import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';
import { UserModule } from '../user/user.module';
import { EmployerService } from './employer.service';
import { EmployerController } from './employer.controller';

@Module({
  imports: [AuthModule, S3Module, UserModule],
  controllers: [EmployerController],
  providers: [EmployerService],
  exports: [EmployerService],
})
export class EmployerModule {}
