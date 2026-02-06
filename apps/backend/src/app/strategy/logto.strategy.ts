import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-openidconnect';
import type { StrategyOptions } from 'passport-openidconnect';

@Injectable()
export class LogtoStrategy extends PassportStrategy(Strategy, 'logto') {
  constructor() {
    const publicHost =
      process.env.LOGTO_PUBLIC_ENDPOINT || 'http://localhost:3001';
    const internalHost =
      process.env.LOGTO_INTERNAL_ENDPOINT || 'http://logto:3001';
    const secret = process.env.LOGTO_CLIENT_SECRET || '';
    console.log(
      `🔐 DEBUG: Secret length is ${
        secret.length
      }. Starts with: [${secret.substring(0, 3)}]`
    );

    if (secret.length === 0) {
      console.error(
        '❌ CRITICAL: LOGTO_CLIENT_SECRET is empty! Check your .env file.'
      );
    }
    // We cast to 'StrategyOptions' just to satisfy the base type requirements,
    // but we add 'as any' to allow the extra properties we need for Docker networking.
    super({
      issuer: `${publicHost}/oidc`,
      authorizationURL: `${publicHost}/oidc/auth`,
      tokenURL: `${internalHost}/oidc/token`,
      userInfoURL: `${internalHost}/oidc/me`,
      jwks_uri: `${internalHost}/oidc/jwks`,

      clientID: process.env.LOGTO_CLIENT_ID || '',
      clientSecret: process.env.LOGTO_CLIENT_SECRET || '',

      callbackURL:
        process.env.LOGTO_REDIRECT_URI ||
        'http://localhost:3000/api/auth/callback/logto',

      scope: ['profile', 'openid', 'email'],
    } as unknown as StrategyOptions);
  }

  override authorizationParams(options: Record<string, unknown>) {
    const params: Record<string, string> = {};
    const interactionMode = options?.interaction_mode;
    const responseMode = options?.response_mode;

    if (typeof interactionMode === 'string') {
      params.interaction_mode = interactionMode;
    }
    if (typeof responseMode === 'string') {
      params.response_mode = responseMode;
    }

    return params;
  }

  override async validate(
    issuer: string,
    profile: Profile,
  ): Promise<Record<string, unknown>> {
    if (!profile) {
      throw new UnauthorizedException('No profile received');
    }
    const { id, ...rest } = profile;
    const stableId = (profile as Profile & { sub?: string }).sub || id;
    return {
      id: stableId,
      ...rest,
    };
  }
}
