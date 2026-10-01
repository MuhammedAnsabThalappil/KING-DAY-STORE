import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof ZodError) {
    return sendError(
      res,
      'Validation failed for input data',
      'VALIDATION_ERROR',
      400,
      err.errors
    );
  }

  if (err.code === 'P2002') {
    return sendError(
      res,
      `A unique constraint violation occurred on field: ${err.meta?.target || 'unknown'}`,
      'DUPLICATE_ENTRY',
      409
    );
  }

  if (err.code === 'P2025') {
    return sendError(
      res,
      'Requested database record was not found',
      'NOT_FOUND',
      44
    );
  }

  const message = err.message || 'An unexpected error occurred on the server';
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, code, statusCode);
}
