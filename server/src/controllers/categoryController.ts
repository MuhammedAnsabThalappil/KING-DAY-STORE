import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.activeOnly === 'false' ? false : true;
    const categories = await CategoryService.getCategories(activeOnly);
    return sendSuccess(res, categories, 'Categories fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCategoryByIdOrSlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const category = await CategoryService.getCategoryBySlugOrId(id);
    if (!category) {
      return sendError(res, `Category not found: ${id}`, 'NOT_FOUND', 404);
    }
    return sendSuccess(res, category, 'Category details fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await CategoryService.createCategory(req.body);
    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updated = await CategoryService.updateCategory(id, req.body);
    return sendSuccess(res, updated, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
}
