import { Request, Response, NextFunction } from 'express';
import { processImageUpload } from '../config/storage.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return sendError(res, 'No image file uploaded', 'MISSING_FILE', 400);
    }

    const imageUrl = await processImageUpload(req.file);
    return sendSuccess(res, {
      imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, 'Image uploaded successfully');
  } catch (error) {
    next(error);
  }
}
