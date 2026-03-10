import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmployerService } from './employer.service';
import { EmployerController } from './employer.controller';

@Module({
  imports: [AuthModule],
  controllers: [EmployerController],
  providers: [EmployerService],
})
export class EmployerModule {}
