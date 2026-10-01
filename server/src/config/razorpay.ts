import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export let razorpayInstance: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET
    });
    logger.info('Razorpay SDK initialized in mode: LIVE/TEST');
  } catch (err) {
    logger.error('Failed to initialize Razorpay SDK:', err);
  }
} else {
  logger.warn('RAZORPAY credentials missing. Payment gateway operating in fallback/test mode.');
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!env.RAZORPAY_KEY_SECRET) {
    logger.warn('Razorpay signature verification skipped - secret missing');
    return false;
  }
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === signature;
}

export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string
): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return false;
  }
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}
