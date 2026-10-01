import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService.js';
import { sendSuccess } from '../utils/response.js';

export async function createPaymentOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId } = req.body;
    const paymentDetails = await PaymentService.createRazorpayOrder(orderId);
    return sendSuccess(res, paymentDetails, 'Razorpay order generated');
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await PaymentService.verifyPayment(
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    return sendSuccess(res, order, 'Payment verified and order confirmed successfully');
  } catch (error) {
    next(error);
  }
}
