import { prisma } from '../config/prisma.js';
import { TransactionType } from '@prisma/client';

export class InventoryService {
  static async getInventoryOverview() {
    const [inventories, lowStockProducts] = await Promise.all([
      prisma.inventory.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              salePrice: true,
              active: true,
              images: { take: 1, orderBy: { isPrimary: 'desc' } }
            }
          }
        },
        orderBy: { quantity: 'asc' }
      }),
      prisma.inventory.findMany({
        where: {
          availableQuantity: { lte: 5 }
        },
        include: {
          product: { select: { id: true, name: true, sku: true } }
        }
      })
    ]);

    return {
      inventories,
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    };
  }

  static async getTransactions(productId?: string, limit = 50) {
    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    return await prisma.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        product: { select: { name: true, sku: true } }
      }
    });
  }

  static async adjustInventory(
    productId: string,
    type: TransactionType,
    quantity: number,
    note?: string,
    referenceType?: string,
    referenceId?: string
  ) {
    return await prisma.$transaction(async (tx: any) => {
      const inv = await tx.inventory.findUnique({
        where: { productId }
      });

      if (!inv) {
        throw new Error(`Inventory record not found for Product ID: ${productId}`);
      }

      let newQuantity = inv.quantity;
      if (type === TransactionType.PURCHASE || type === TransactionType.RETURN || type === TransactionType.CANCELLATION) {
        newQuantity += Math.abs(quantity);
      } else if (type === TransactionType.SALE || type === TransactionType.DAMAGE || type === TransactionType.ADJUSTMENT) {
        newQuantity -= Math.abs(quantity);
      }

      if (newQuantity < 0) {
        throw new Error(`Invalid stock operation: Resulting inventory cannot be negative (${newQuantity}).`);
      }

      const availableQuantity = newQuantity - inv.reservedQuantity;

      const updatedInv = await tx.inventory.update({
        where: { productId },
        data: {
          quantity: newQuantity,
          availableQuantity
        }
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId,
          type,
          quantity: Math.abs(quantity),
          previousQuantity: inv.quantity,
          newQuantity,
          referenceType,
          referenceId,
          note
        }
      });

      return { inventory: updatedInv, transaction };
    });
  }
}
