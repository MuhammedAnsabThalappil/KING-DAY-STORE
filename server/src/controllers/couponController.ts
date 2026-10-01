import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, cartAmount } = req.body;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.active) {
      return sendError(res, 'Invalid or expired coupon code', 'INVALID_COUPON', 400);
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return sendError(res, 'This coupon code has expired', 'COUPON_EXPIRED', 400);
    }

    if (cartAmount < Number(coupon.minimumOrderAmount)) {
      return sendError(
        res,
        `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon`,
        'MINIMUM_AMOUNT_NOT_MET',
        400
      );
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (cartAmount * Number(coupon.value)) / 100;
      if (coupon.maximumDiscount && discountAmount > Number(coupon.maximumDiscount)) {
        discountAmount = Number(coupon.maximumDiscount);
      }
    } else {
      discountAmount = Number(coupon.value);
    }

    return sendSuccess(
      res,
      {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount
      },
      'Coupon applied successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function getCoupons(req: Request, res: Response, next: NextFunction) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, coupons, 'Coupons loaded');
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: req.body.code.toUpperCase(),
        type: req.body.type,
        value: req.body.value,
        minimumOrderAmount: req.body.minimumOrderAmount || 0,
        maximumDiscount: req.body.maximumDiscount,
        usageLimit: req.body.usageLimit,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
        active: req.body.active !== undefined ? req.body.active : true
      }
    });
    return sendSuccess(res, coupon, 'Coupon created', 201);
  } catch (error) {
    next(error);
  }
}
