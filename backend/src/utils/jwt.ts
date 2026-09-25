import jwt from 'jsonwebtoken';
import { getEnv } from '../config/env';
import { AuthUser, UserRole } from '../types/auth';

export function signToken(user: AuthUser): string {
  const { jwtSecret, jwtExpiresIn } = getEnv();
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: jwtExpiresIn } as jwt.SignOptions
  );
}

export function verifyToken(token: string): AuthUser {
  const { jwtSecret } = getEnv();
  const payload = jwt.verify(token, jwtSecret) as {
    id: string;
    role: UserRole;
    email: string;
  };

  if (!payload?.id || !payload?.email || !payload?.role) {
    throw new Error('Invalid token payload');
  }

  return { id: payload.id, role: payload.role, email: payload.email };
}
