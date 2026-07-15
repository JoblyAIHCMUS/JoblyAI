import 'better-auth';

declare module 'better-auth' {
  interface User {
    role?: 'candidate' | 'employer' | 'admin';
  }
}
