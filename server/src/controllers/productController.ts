import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      search,
      categoryId,
      categorySlug,
      brand,
      minPrice,
      maxPrice,
      featured,
      activeOnly,
      sortBy,
      page,
      limit
    } = req.query;

    const result = await ProductService.getProducts({
      search: search as string,
      categoryId: categoryId as string,
      categorySlug: categorySlug as string,
      brand: brand as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      activeOnly: activeOnly === 'false' ? false : true,
      sortBy: sortBy as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12
    });

    return sendSuccess(res, result, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdOrSlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductBySlugOrId(id);
    if (!product) {
      return sendError(res, `Product not found with identifier: ${id}`, 'NOT_FOUND', 404);
    }
    return sendSuccess(res, product, 'Product fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const newProduct = await ProductService.createProduct(req.body);
    return sendSuccess(res, newProduct, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updatedProduct = await ProductService.updateProduct(id, req.body);
    return sendSuccess(res, updatedProduct, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await ProductService.deleteProduct(id);
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
}
