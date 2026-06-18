import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

/**
 * Apply a simple rate limiter: max 5 requests per minute per IP.
 * Adjust limits via environment variables if needed.
 */
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || '5', 10), // limit each IP to 5 requests per windowMs
  handler: (req: Request, res: Response) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});

export function applyRateLimiter(req: Request, res: Response, next: NextFunction) {
  rateLimiter(req as any, res as any, next);
}
