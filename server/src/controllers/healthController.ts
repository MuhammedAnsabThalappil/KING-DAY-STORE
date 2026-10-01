import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getHealth(req: Request, res: Response) {
  const isDbConnected = await checkDatabaseConnection();
  
  if (!isDbConnected) {
    return res.status(503).json({
      success: false,
      api: 'ok',
      database: 'error',
      message: 'Database connection check failed'
    });
  }

  return sendSuccess(res, {
    api: 'ok',
    database: 'ok',
    timestamp: new Date().toISOString()
  }, 'KING DAY API and PostgreSQL Database operational');
}
