import prisma from '../config/prisma.js';
import { sendSuccess } from '../utils/response.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalVideos,
      publishedVideos,
      draftVideos,
      totalCategories,
      totalRoles,
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      recentPendingUsers,
      recentVideos,
    ] = await Promise.all([
      prisma.video.count(),
      prisma.video.count({ where: { status: 'PUBLISHED' } }),
      prisma.video.count({ where: { status: 'DRAFT' } }),
      prisma.category.count(),
      prisma.role.count(),
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.video.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
        },
      }),
    ]);

    return sendSuccess(res, 'Statistik dashboard admin berhasil dimuat.', {
      counts: {
        videos: {
          total: totalVideos,
          published: publishedVideos,
          draft: draftVideos,
        },
        categories: totalCategories,
        roles: totalRoles,
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
          suspended: suspendedUsers,
        },
      },
      recentPendingUsers,
      recentVideos,
    });
  } catch (error) {
    next(error);
  }
}
