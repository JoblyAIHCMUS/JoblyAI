import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Issuer } from 'openid-client';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'LogtoClient',
      useFactory: async () => {
        // Public = localhost (for Browser)
        const publicEndpoint = process.env.LOGTO_ENDPOINT || 'http://localhost:3001'; 
        // Internal = jobly_logto (for Backend)
        const internalIssuer = process.env.LOGTO_ISSUER_URL || 'http://jobly_logto:3001/oidc';
        console.log(`🔌 Auth Config: Public=[${publicEndpoint}] Internal=[${internalIssuer}]`);
        const issuer = new Issuer({
          // The Identity of the server (Must match what Logto sends in the token)
          // Usually: http://localhost:3001/oidc
          issuer: `${publicEndpoint.replace(/\/$/, '')}/oidc`, 
          
          // BROWSER URL: Users click this to login
          // Must be reachable by Chrome/Edge (localhost)
          authorization_endpoint: `${publicEndpoint.replace(/\/$/, '')}/oidc/auth`,
          
          // BACKEND URLs: NestJS uses these to talk to Logto
          // Must be reachable by Docker (jobly_logto)
          token_endpoint: `http://jobly_logto:3001/oidc/token`,
          userinfo_endpoint: `http://jobly_logto:3001/oidc/me`,
          jwks_uri: `http://jobly_logto:3001/oidc/jwks`,
        });
        
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