import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const isProd = process.env.NODE_ENV === 'production';

// In production, critical secrets MUST come from environment variables.
// Fail fast with a clear message rather than silently using insecure defaults.
if (isProd) {
  const required = ['JWT_SECRET', 'ADMIN_PASSWORD', 'DATABASE_URL'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`FATAL: Required environment variable "${key}" is not set. The server will not start.`);
    }
  }
}

function sanitizeDatabaseUrl(url?: string): string {
  if (!url) return 'postgresql://postgres:postgres@localhost:5432/kingdaydb?schema=public';
  // Prisma's Rust engine fails connection negotiation when channel_binding=require is enforced
  return url.replace(/([?&])channel_binding=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: sanitizeDatabaseUrl(process.env.DATABASE_URL),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  // No hardcoded production secret — in development a local-only key is acceptable
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-jwt-secret-DO-NOT-USE-IN-PROD',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  ADMIN_ID: process.env.ADMIN_ID || 'admin',
  // No hardcoded password — require env var in production
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || (isProd ? '' : 'dev-local-only'),

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local', // 'local' or 's3'
  S3_BUCKET: process.env.S3_BUCKET || '',
  S3_REGION: process.env.S3_REGION || '',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || ''
};
