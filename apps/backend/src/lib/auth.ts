import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { expo } from '@better-auth/expo';
import { admin } from 'better-auth/plugins';
import { emailOTP } from 'better-auth/plugins';
import { prisma, redis } from './db';
import {
  admin as adminRole,
  candidate,
  employer,
  superAdmin,
} from './permission';
import { getTransporter } from './mailingService';
import nodemailer from 'nodemailer';

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
    'jobly://',
    'jobly://*',
    ...(process.env.NODE_ENV === 'development'
      ? ['exp://', 'exp://**', 'exp://192.168.*.*:*/**']
      : []),
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
    expo(),
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
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'forget-password') {
          try {
            const transporter = await getTransporter();
            const info = await transporter.sendMail({
              from: 'noreply@JoblyAI.com',
              to: email,
              subject: 'Your Password Reset Code',
              text: `Your password reset code is: ${otp}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2>Password Reset</h2>
                  <p>Your one-time passcode is:</p>
                  <h1 style="letter-spacing: 5px; color: #007bff;">${otp}</h1>
                  <p>Enter this code on the verification page to reset your password.</p>
                </div>
              `,
            });
            console.log('\n========================================');
            console.log('MOCK EMAIL SENT');
            console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            console.log('========================================\n');
          } catch (e) {
            console.error('ERROR: Failed to send Ethereal email:', e);
          }
        }
      },
    }),
  ],
});
