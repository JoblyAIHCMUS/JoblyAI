import { Injectable } from '@nestjs/common';
import { auth } from '../../lib/auth';
import { redis } from '../../lib/db';

@Injectable()
export class AuthService {
  /**
   * Get session from cache or database
   */
  async getSession(sessionToken: string) {
    // Try to get from Redis cache first
    const cacheKey = `session:${sessionToken}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, verify with better-auth
    const session = await auth.api.getSession({
      headers: {
        authorization: `Bearer ${sessionToken}`,
      },
    });

    if (session) {
      // Cache the session for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(session));
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
   * Get auth instance for direct API calls
   */
  getAuthInstance() {
    return auth;
  }
}
