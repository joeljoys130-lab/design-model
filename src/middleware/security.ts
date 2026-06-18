import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import { applyRateLimiter } from './rateLimiter';
/**
 * Apply common security middlewares: Helmet, CORS, and Cookie‑Parser.
 * Adjust origins as needed for production.
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
  })(req, res, () => {
    cors({
      origin: process.env.NEXT_PUBLIC_ORIGIN || '*',
      credentials: true,
    })(req, res, () => {
      applyRateLimiter(req, res, () => {
        console.log(`${req.method} ${req.originalUrl}`);
        cookieParser()(req, res, next);
        next();
      });
    });
  });
}
