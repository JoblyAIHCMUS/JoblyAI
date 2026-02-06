import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LogtoStrategy } from '../strategy/logto.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'logto', session: true }),
  ],
  controllers: [AuthController],
  providers: [LogtoStrategy],
})
export class AuthModule {}
