import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingOrdersCount,
      paidOrders,
      recentOrders,
      inventorySummary
    ] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.inventory.count({
        where: { availableQuantity: { lte: 5 } }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { totalAmount: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, items: true }
      }),
      prisma.inventory.aggregate({
        _sum: { quantity: true, reservedQuantity: true }
      })
    ]);

    const totalRevenue = paidOrders.reduce((sum: number, o: { totalAmount: any }) => sum + Number(o.totalAmount), 0);

    // Sales breakdown by status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    return sendSuccess(res, {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount,
      pendingOrdersCount,
      recentOrders,
      totalStockUnits: inventorySummary._sum.quantity || 0,
      reservedStockUnits: inventorySummary._sum.reservedQuantity || 0,
      statusBreakdown: statusCounts.reduce((acc: Record<string, number>, curr: { status: string; _count: { id: number } }) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, {})
    }, 'Admin metrics loaded from real database');
  } catch (error) {
    next(error);
  }
}
