import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function processAiProductAssistant(req: Request, res: Response, next: NextFunction) {
  try {
    const { rawText } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return sendError(res, 'Please provide product information text to process.', 'INVALID_INPUT', 400);
    }

    const result = await AIService.extractProductData(rawText);

    return sendSuccess(res, result, 'Product information processed and organized successfully');
  } catch (error: any) {
    console.error('AI Product Assistant Controller Error:', error);
    return sendError(res, error.message || 'AI could not process this information.', 'AI_PROCESSING_ERROR', 500);
  }
}
