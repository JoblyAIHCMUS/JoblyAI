import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Issuer } from 'openid-client'; // Make sure this is v5!

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'LogtoClient',
      useFactory: async () => {
        // This function runs once when the app starts
        const issuer = await Issuer.discover(
          process.env.LOGTO_ISSUER_URL ?? 'https://your-logto-instance.com'
        );
        
        // We return the actual Client object here
        return new issuer.Client({
          client_id: process.env.LOGTO_CLIENT_ID ?? 'your_id',
          client_secret: process.env.LOGTO_CLIENT_SECRET ?? 'your_secret',
          redirect_uris: ['http://localhost:3000/auth/callback'],
          response_types: ['code'],
        });
      },
    },
  ],
  exports: ['LogtoClient'],
})
export class AuthModule {}