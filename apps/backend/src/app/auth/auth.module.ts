import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard], // Exporting it so other modules can use the Guard,
  //  which is like @PreAuthorize("isAuthenticated()") in Spring Security
})
export class AuthModule {}