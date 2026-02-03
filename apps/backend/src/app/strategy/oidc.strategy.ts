import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Issuer, Client } from 'openid-client';

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  constructor() {
    // This is a simplified logic to initialize the client
    const issuer = await Issuer.discover(process.env.LOGTO_URL || 'http://localhost:3001/oidc');
    const client = new issuer.Client({
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      redirect_uris: ['http://localhost:3000/auth/callback'],
      response_types: ['code'],
    });

    super({
      client,
      params: {
        scope: 'openid profile email',
      },
    });
  }

  async validate(tokenset: any): Promise<any> {
    const userinfo = await this.client.userinfo(tokenset.access_token);
    return userinfo;
  }
}