import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';

/**
 * GET /api/customers  (admin-only)
 * Returns a deduplicated customer list with total order count and lifetime spend.
 */
export async function getCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query.search as string | undefined;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, parseInt((req.query.limit as string) || '25', 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          active: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { totalAmount: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    const enriched = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      active: c.active,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      totalSpend: c.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    }));

    return sendSuccess(
      res,
      { customers: enriched, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      'Customer directory retrieved'
    );
  } catch (error) {
    next(error);
  }
}

