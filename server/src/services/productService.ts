import { prisma } from '../config/prisma.js';
import { TransactionType } from '@prisma/client';

export interface ProductQueryOptions {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  activeOnly?: boolean;
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';
  page?: number;
  limit?: number;
}

export class ProductService {
  static async getProducts(options: ProductQueryOptions) {
    const {
      search,
      categoryId,
      categorySlug,
      brand,
      minPrice,
      maxPrice,
      featured,
      activeOnly = true,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = options;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (activeOnly) {
      where.active = true;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (categorySlug) {
      const cat = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: true }
      });
      if (cat) {
        const categoryIds = [cat.id, ...cat.children.map((c: any) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.salePrice = {};
      if (minPrice !== undefined) where.salePrice.gte = minPrice;
      if (maxPrice !== undefined) where.salePrice.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'featured') orderBy = { featured: 'desc' };
    else if (sortBy === 'price-asc') orderBy = { salePrice: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { salePrice: 'desc' };
    else if (sortBy === 'name') orderBy = { name: 'asc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true, parentId: true }
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
          },
          inventory: true,
          specifications: { orderBy: { sortOrder: 'asc' } },
          features: { orderBy: { sortOrder: 'asc' } }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getProductBySlugOrId(identifier: string) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
          { sku: identifier }
        ]
      },
      include: {
        category: {
          include: {
            parent: true
          }
        },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        specifications: { orderBy: { sortOrder: 'asc' } },
        features: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { active: true } },
        inventory: true,
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return product;
  }

  static async createProduct(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    return await prisma.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug,
          sku: data.sku,
          brand: data.brand || 'KING DAY',
          categoryId: data.categoryId,
          description: data.description,
          shortDescription: data.shortDescription,
          mrp: data.mrp,
          salePrice: data.salePrice,
          discount: data.discount || Math.round(((data.mrp - data.salePrice) / data.mrp) * 100),
          featured: data.featured || false,
          active: data.active !== undefined ? data.active : true,
          seoTitle: data.seoTitle || data.name,
          seoDescription: data.seoDescription || data.shortDescription,
          images: data.images ? {
            create: data.images.map((img: any, idx: number) => ({
              imageUrl: img.imageUrl,
              altText: img.altText || data.name,
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: img.sortOrder ?? idx
            }))
          } : undefined,
          specifications: data.specifications ? {
            create: data.specifications.map((spec: any, idx: number) => ({
              name: spec.name,
              value: spec.value,
              sortOrder: spec.sortOrder ?? idx
            }))
          } : undefined,
          features: data.features ? {
            create: data.features.map((feat: string, idx: number) => ({
              feature: feat,
              sortOrder: idx
            }))
          } : undefined,
          inventory: {
            create: {
              quantity: data.stock || 0,
              reservedQuantity: 0,
              availableQuantity: data.stock || 0,
              lowStockThreshold: data.lowStockThreshold || 5
            }
          }
        },
        include: {
          category: true,
          images: true,
          inventory: true,
          specifications: true,
          features: true
        }
      });

      if (data.stock && data.stock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: TransactionType.PURCHASE,
            quantity: data.stock,
            previousQuantity: 0,
            newQuantity: data.stock,
            note: 'Initial product creation stock entry'
          }
        });
      }

      return product;
    }, {
      maxWait: 10000,
      timeout: 20000
    });
  }

  static async updateProduct(id: string, data: any) {
    return await prisma.$transaction(async (tx: any) => {
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      if (data.specifications) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
      }
      if (data.features) {
        await tx.productFeature.deleteMany({ where: { productId: id } });
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku,
          brand: data.brand,
          categoryId: data.categoryId,
          description: data.description,
          shortDescription: data.shortDescription,
          mrp: data.mrp,
          salePrice: data.salePrice,
          discount: data.mrp && data.salePrice ? Math.round(((data.mrp - data.salePrice) / data.mrp) * 100) : undefined,
          featured: data.featured,
          active: data.active,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          images: data.images ? {
            create: data.images.map((img: any, idx: number) => ({
              imageUrl: img.imageUrl,
              altText: img.altText || data.name,
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: img.sortOrder ?? idx
            }))
          } : undefined,
          specifications: data.specifications ? {
            create: data.specifications.map((spec: any, idx: number) => ({
              name: spec.name,
              value: spec.value,
              sortOrder: spec.sortOrder ?? idx
            }))
          } : undefined,
          features: data.features ? {
            create: data.features.map((feat: string, idx: number) => ({
              feature: feat,
              sortOrder: idx
            }))
          } : undefined
        },
        include: {
          category: true,
          images: true,
          inventory: true,
          specifications: true,
          features: true
        }
      });

      if (data.stock !== undefined) {
        const inv = await tx.inventory.findUnique({ where: { productId: id } });
        if (inv && inv.quantity !== data.stock) {
          const diff = data.stock - inv.quantity;
          await tx.inventory.update({
            where: { productId: id },
            data: {
              quantity: data.stock,
              availableQuantity: data.stock - inv.reservedQuantity
            }
          });
          await tx.inventoryTransaction.create({
            data: {
              productId: id,
              type: diff > 0 ? TransactionType.PURCHASE : TransactionType.ADJUSTMENT,
              quantity: Math.abs(diff),
              previousQuantity: inv.quantity,
              newQuantity: data.stock,
              note: 'Manual inventory adjustment via admin product edit'
            }
          });
        }
      }

      return updated;
    }, {
      maxWait: 10000,
      timeout: 20000
    });
  }

  static async deleteProduct(id: string) {
    return await prisma.product.delete({
      where: { id }
    });
  }
}
