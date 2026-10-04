import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, cartAmount, orderAmount } = req.body;
    const amount = Number(cartAmount || orderAmount || 0);

    if (!code) {
      return sendError(res, 'Coupon code is required', 'MISSING_CODE', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase() }
    });

    if (!coupon || !coupon.active) {
      return sendError(res, 'Invalid or expired coupon code', 'INVALID_COUPON', 400);
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return sendError(res, 'This coupon code has expired', 'COUPON_EXPIRED', 400);
    }

    if (amount < Number(coupon.minimumOrderAmount)) {
      return sendError(
        res,
        `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon`,
        'MINIMUM_AMOUNT_NOT_MET',
        400
      );
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (amount * Number(coupon.value)) / 100;
      if (coupon.maximumDiscount && discountAmount > Number(coupon.maximumDiscount)) {
        discountAmount = Number(coupon.maximumDiscount);
      }
    } else {
      discountAmount = Number(coupon.value);
    }

    return sendSuccess(
      res,
      {
        valid: true,
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
    const couponType = req.body.type || req.body.discountType || 'PERCENTAGE';
    const couponValue = req.body.value !== undefined ? req.body.value : req.body.discountValue;
    const minOrder = req.body.minimumOrderAmount !== undefined ? req.body.minimumOrderAmount : req.body.minOrderAmount;
    const maxDiscount = req.body.maximumDiscount !== undefined ? req.body.maximumDiscount : req.body.maxDiscountAmount;

    if (couponValue === undefined || couponValue === null) {
      return sendError(res, 'Coupon discount value is required', 'MISSING_VALUE', 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: String(req.body.code).toUpperCase(),
        type: couponType,
        value: Number(couponValue),
        minimumOrderAmount: minOrder ? Number(minOrder) : 0,
        maximumDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: req.body.usageLimit ? Number(req.body.usageLimit) : null,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
        active: req.body.active !== undefined ? Boolean(req.body.active) : true
      }
    });
    return sendSuccess(res, coupon, 'Coupon created', 201);
  } catch (error) {
    next(error);
  }
}
