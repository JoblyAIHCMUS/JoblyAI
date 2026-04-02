export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  avatarUrl?: string;
  role: 'admin' | 'employer' | 'candidate';
  createdAt: Date;
  updatedAt: Date;
}
