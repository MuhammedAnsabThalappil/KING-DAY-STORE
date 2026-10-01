import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await OrderService.createOrder(req.body);
    return sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = (req as any).user?.id || (req.query.customerId as string);
    const status = req.query.status as any;
    const paymentStatus = req.query.paymentStatus as any;
    const search = req.query.search as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;

    const result = await OrderService.getOrders({
      customerId,
      status,
      paymentStatus,
      search,
      page,
      limit
    });

    return sendSuccess(res, result, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    if (!order) {
      return sendError(res, `Order not found with identifier: ${id}`, 'NOT_FOUND', 404);
    }
    return sendSuccess(res, order, 'Order details loaded');
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await OrderService.updateOrderStatus(id, status);
    return sendSuccess(res, updated, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updated = await OrderService.updateOrderStatus(id, 'CANCELLED' as any);
    return sendSuccess(res, updated, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
}
