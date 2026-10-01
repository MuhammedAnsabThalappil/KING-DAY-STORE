import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 300; // 300 requests per 15 mins per IP

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown-ip';
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS
    };
    return next();
  }

  if (now > store[ip].resetTime) {
    store[ip].count = 1;
    store[ip].resetTime = now + WINDOW_MS;
    return next();
  }

  store[ip].count++;
  if (store[ip].count > MAX_REQUESTS) {
    return sendError(res, 'Too many requests, please try again later.', 'RATE_LIMIT_EXCEEDED', 429);
  }

  next();
}
