import type { Request as ExpressRequest } from 'express';

export interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    emailVerified: boolean;
    image?: string;
    role?: string;
  };
  session: unknown;
}
