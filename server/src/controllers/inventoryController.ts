import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventoryService.js';
import { sendSuccess } from '../utils/response.js';

export async function getInventoryOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await InventoryService.getInventoryOverview();
    return sendSuccess(res, data, 'Inventory status loaded');
  } catch (error) {
    next(error);
  }
}

export async function getInventoryTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params;
    const transactions = await InventoryService.getTransactions(productId);
    return sendSuccess(res, transactions, 'Inventory transactions retrieved');
  } catch (error) {
    next(error);
  }
}

export async function adjustStock(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, type, quantity, note } = req.body;
    const result = await InventoryService.adjustInventory(productId, type, quantity, note);
    return sendSuccess(res, result, 'Stock adjustment completed successfully');
  } catch (error) {
    next(error);
  }
}
