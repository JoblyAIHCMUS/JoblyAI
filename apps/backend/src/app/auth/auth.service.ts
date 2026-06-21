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

  /** Delete a single session from secondaryStorage. Key is the session token (no prefix). */
  async invalidateSessionCache(sessionToken: string) {
    await redis.del(sessionToken);
  }

  /** Re-cache the user object across all active sessions — mirrors better-auth's internal refreshUserSessions. */
  async refreshUserSessionCache(updatedUser: {
    id: string;
    [key: string]: unknown;
  }) {
    const listKey = `active-sessions-${updatedUser.id}`;
    const listRaw = await redis.get(listKey);
    if (!listRaw) return;

    let list: Array<{ token: string; expiresAt: number }>;
    try {
      list = JSON.parse(listRaw);
    } catch {
      return;
    }
    if (!Array.isArray(list)) return;

    const now = Date.now();
    await Promise.all(
      list
        .filter((s) => s && s.token && s.expiresAt > now)
        .map(async (session) => {
          const cached = await redis.get(session.token);
          if (!cached) return;
          let parsed: {
            session: { expiresAt: string | number | Date };
            user: Record<string, unknown>;
          } | null;
          try {
            parsed = JSON.parse(cached);
          } catch {
            return;
          }
          if (!parsed?.session?.expiresAt) return;

          const expiresAtMs = new Date(parsed.session.expiresAt).getTime();
          const sessionTTL = Math.floor((expiresAtMs - now) / 1000);
          if (sessionTTL <= 0) return;

          await redis.setex(
            session.token,
            sessionTTL,
            JSON.stringify({
              session: parsed.session,
              user: { ...parsed.user, ...updatedUser },
            })
          );
        })
    );
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
