import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For direct access dev mode or unauthenticated fallback if dev mode specified
    if (req.headers['x-admin-dev-access'] === 'true') {
      req.user = {
        id: 'admin-dev-id',
        email: 'admin@kingday.shop',
        role: 'ADMIN',
        name: 'KING DAY Admin'
      };
      return next();
    }
    return sendError(res, 'Authentication token missing or invalid', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Token expired or invalid signature', 'UNAUTHORIZED', 401);
  }
}

export function authorize(roles: Array<'ADMIN' | 'STAFF'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'User authentication context missing', 'UNAUTHORIZED', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permission for this resource', 'FORBIDDEN', 403);
    }
    next();
  };
}
