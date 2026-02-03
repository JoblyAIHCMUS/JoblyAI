import { Injectable, Inject } from '@nestjs/common';
import type { Client } from 'openid-client';

@Injectable()
export class AuthService {
  constructor(@Inject('LogtoClient') private readonly logtoClient: Client) {}

  /**
   * Generates a URL to redirect the user directly to the
   * Logto Registration (Sign-up) screen.
   */
  getRegisterUrl(): string {
    return this.logtoClient.authorizationUrl({
      scope: 'openid profile email',
      // interaction_mode: 'signUp' tells Logto to show the Register tab first
      interaction_mode: 'signUp',
      // The redirect_uri must match exactly what you saved in Logto Console
      redirect_uri: 'http://localhost:3000/api/auth/callback/logto',
    });
  }
}
