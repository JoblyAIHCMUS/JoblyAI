export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  role: 'admin' | 'employer' | 'candidate';
  createdAt: Date;
  updatedAt: Date;
}
