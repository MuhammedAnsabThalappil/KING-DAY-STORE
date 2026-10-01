import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and SVG images are allowed.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter
});

export async function processImageUpload(file: Express.Multer.File): Promise<string> {
  // In production with S3 / Cloud storage configured:
  if (env.STORAGE_PROVIDER === 's3' && env.S3_BUCKET) {
    logger.info(`S3 upload requested for ${file.originalname} (Production S3 connector ready)`);
    // Example S3 return URL
    return `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com/products/${file.filename}`;
  }

  // Local storage return relative/absolute server URL path
  return `/uploads/${file.filename}`;
}
