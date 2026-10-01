import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';

export async function getBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.activeOnly === 'false' ? false : true;
    const banners = await prisma.banner.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { sortOrder: 'asc' }
    });
    return sendSuccess(res, banners, 'Banners fetched');
  } catch (error) {
    next(error);
  }
}

export async function createBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const banner = await prisma.banner.create({
      data: req.body
    });
    return sendSuccess(res, banner, 'Banner created', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    return sendSuccess(res, null, 'Banner deleted');
  } catch (error) {
    next(error);
  }
}
