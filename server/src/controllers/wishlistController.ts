import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = (req as any).user?.id || (req.query.customerId as string);
    if (!customerId) {
      return sendSuccess(res, [], 'Empty wishlist (unauthenticated)');
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                inventory: true
              }
            }
          }
        }
      }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { customerId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                  inventory: true
                }
              }
            }
          }
        }
      });
    }

    const products = wishlist?.items ? wishlist.items.map((i: any) => i.product) : [];
    return sendSuccess(res, products, 'Wishlist retrieved');
  } catch (error) {
    next(error);
  }
}

export async function toggleWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = (req as any).user?.id || req.body.customerId;
    const { productId } = req.body;

    if (!customerId) {
      return sendError(res, 'Customer ID required for wishlist operations', 'UNAUTHORIZED', 401);
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { customerId }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { customerId }
      });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return sendSuccess(res, { isSaved: false }, 'Product removed from wishlist');
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId
        }
      });
      return sendSuccess(res, { isSaved: true }, 'Product added to wishlist');
    }
  } catch (error) {
    next(error);
  }
}
