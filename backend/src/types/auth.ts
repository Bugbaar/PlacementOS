export type UserRole = 'student' | 'admin' | 'recruiter';

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
