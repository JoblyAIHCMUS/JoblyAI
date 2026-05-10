import { AuthUser } from './authUser';
import { AuthSession } from './authSession';

export interface SessionPayload {
  user: AuthUser;
  session: AuthSession;
}
