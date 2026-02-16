import type { Request as ExpressRequest } from 'express';
import { AuthUser } from './authUser';
import { AuthSession } from './authSession';

export interface AuthenticatedRequest extends ExpressRequest {
  user: AuthUser;
  session: AuthSession;
}
