import { prisma } from '../config/prisma.js';

export class CategoryService {
  static async getCategories(activeOnly = true) {
    const where: any = {};
    if (activeOnly) {
      where.active = true;
    }

    const categories = await prisma.category.findMany({
      where: {
        ...where,
        parentId: null // top-level categories
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where,
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return categories;
  }

  static async getCategoryBySlugOrId(identifier: string) {
    return await prisma.category.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier }
        ]
      },
      include: {
        parent: true,
        children: {
          include: {
            _count: { select: { products: true } }
          }
        },
        products: {
          where: { active: true },
          take: 12,
          include: {
            images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            inventory: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });
  }

  static async createCategory(data: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId || null,
        sortOrder: data.sortOrder || 0,
        active: data.active !== undefined ? data.active : true
      },
      include: { parent: true, children: true }
    });
  }

  static async updateCategory(id: string, data: any) {
    return await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId,
        sortOrder: data.sortOrder,
        active: data.active
      },
      include: { parent: true, children: true }
    });
  }

  static async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id }
    });
  }
}
