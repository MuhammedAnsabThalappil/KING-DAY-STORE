import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService.js';
import { sendSuccess } from '../utils/response.js';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const customerId = (req as any).user?.id || (req.query.customerId as string);
    const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);

    const cart = await CartService.getOrCreateCart(customerId, sessionId);
    return sendSuccess(res, cart, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const { cartId, productId, quantity, variantId, customerId, sessionId } = req.body;
    let targetCartId = cartId;

    if (!targetCartId) {
      const activeCart = await CartService.getOrCreateCart(customerId, sessionId);
      targetCartId = activeCart.id;
    }

    await CartService.addItemToCart(targetCartId, productId, quantity || 1, variantId);
    const updatedCart = await CartService.getOrCreateCart(customerId, sessionId);
    return sendSuccess(res, updatedCart, 'Item added to cart');
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    await CartService.updateItemQuantity(id, quantity);
    return sendSuccess(res, null, 'Cart item updated');
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await CartService.removeItem(id);
    return sendSuccess(res, null, 'Cart item removed');
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const { cartId } = req.body;
    await CartService.clearCart(cartId);
    return sendSuccess(res, null, 'Cart cleared');
  } catch (error) {
    next(error);
  }
}
