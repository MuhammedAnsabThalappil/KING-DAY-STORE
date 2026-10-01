import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message })
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  code: string = 'INTERNAL_SERVER_ERROR',
  statusCode: number = 500,
  details?: any
): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };
  return res.status(statusCode).json(payload);
}
