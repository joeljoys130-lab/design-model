import { verifyAccessToken } from '../lib/auth/jwt';
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware that checks for a valid JWT in the `auth_token` HttpOnly cookie.
 * On success, attaches the decoded payload to `req.user`.
 */
export function authGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  // Attach payload for downstream handlers
  (req as any).user = payload;
  next();
}
