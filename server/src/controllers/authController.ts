import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, adminId, password } = req.body;
    const identifier = (adminId || email || '').trim().toLowerCase();

    // 1. Check development/environment Admin ID or Email credentials
    if (
      (identifier === 'admin' || identifier === 'admin@kingday.shop') &&
      password === env.ADMIN_PASSWORD
    ) {
      const adminToken = jwt.sign(
        {
          id: 'admin-dev-id',
          email: 'admin@kingday.shop',
          role: 'ADMIN',
          name: 'KING DAY Admin'
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return sendSuccess(
        res,
        {
          token: adminToken,
          user: {
            id: 'admin-dev-id',
            name: 'KING DAY Admin',
            email: 'admin@kingday.shop',
            role: 'ADMIN'
          }
        },
        'Welcome to KING DAY Admin'
      );
    }

    // 2. Check Database User Table
    if (identifier.includes('@')) {
      const user = await prisma.user.findUnique({
        where: { email: identifier }
      });

      if (user && user.active) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (isMatch) {
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              role: user.role,
              name: user.name
            },
            env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          return sendSuccess(
            res,
            {
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            },
            'Welcome to KING DAY Admin'
          );
        }
      }
    }

    return sendError(res, 'Invalid admin ID or password', 'INVALID_CREDENTIALS', 401);
  } catch (error) {
    next(error);
  }
}

export async function logoutAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, null, 'You have been logged out');
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userContext = (req as any).user;
    if (!userContext) {
      return sendError(res, 'Unauthenticated', 'UNAUTHORIZED', 401);
    }

    if (userContext.id === 'admin-dev-id') {
      return sendSuccess(
        res,
        {
          id: 'admin-dev-id',
          name: 'KING DAY Admin',
          email: 'admin@kingday.shop',
          role: 'ADMIN'
        },
        'Current admin user profile'
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userContext.id },
      select: { id: true, name: true, email: true, phone: true, role: true, active: true }
    });

    if (!user) {
      return sendError(res, 'User not found', 'NOT_FOUND', 404);
    }

    return sendSuccess(res, user, 'Current user profile');
  } catch (error) {
    next(error);
  }
}
