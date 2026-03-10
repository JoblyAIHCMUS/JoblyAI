import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { prisma, redis } from './db';
import {
  admin as adminRole,
  candidate,
  employer,
  superAdmin,
} from './permission';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secondaryStorage: {
    get: async (key) => {
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      // ttl is in seconds
      if (ttl) {
        await redis.set(key, value, 'EX', ttl);
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if want email verification
  },
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: false,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  trustedOrigins: [
    process.env.APP_URL || 'http://localhost:3000',
    process.env.WEB_URL || 'http://localhost:5173',
    'postman://token',
    'postman://auth',
    'postman://collection',
    'postman://app',
  ],
  secret:
    process.env.BETTER_AUTH_SECRET ||
    'super-secret-better-auth-key-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [
    admin({
      defaultRole: 'candidate',
      adminRoles: ['admin', 'superAdmin'],
      roles: {
        candidate,
        employer,
        admin: adminRole,
        superAdmin,
      },
    }),
  ],
});
