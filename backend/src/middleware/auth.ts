import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  user?: { email: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    req.user = jwt.verify(token, env.jwtSecret) as { email: string; role: string };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
