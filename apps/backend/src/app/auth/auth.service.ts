import { Injectable } from '@nestjs/common';
import { auth } from '../../lib/auth';
import { redis } from '../../lib/db';
import { SessionPayload } from '../types/sessionPayload';

@Injectable()
export class AuthService {
  /**
   * Get session from cache or database
   */
  async getSession(
    reqHeaders: Headers | Record<string, string | string[]>
  ): Promise<SessionPayload | null> {
    console.log('[DEBUG] Fetching session with headers:', reqHeaders);
    const session = (await auth.api.getSession({
      headers: reqHeaders,
    })) as SessionPayload | null;
    if (!session) {
      console.log(`[DEBUG] Session lookup failed.`);
      return null;
    }
    return session;
  }

  /**
   * Invalidate session cache
   */
  async invalidateSessionCache(sessionToken: string) {
    const cacheKey = `session:${sessionToken}`;
    await redis.del(cacheKey);
  }

  /**
   * Validate token and return user and session info
   */
  async validateToken(
    reqHeaders: Headers | Record<string, string | string[]>
  ): Promise<SessionPayload | null> {
    const sessionPayload = await this.getSession(reqHeaders);
    if (!sessionPayload) return null;
    return {
      user: sessionPayload.user,
      session: sessionPayload.session,
    };
  }

  /**
   * Get auth instance for direct API calls
   */
  getAuthInstance() {
    return auth;
  }
}
