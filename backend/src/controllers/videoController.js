import { z } from 'zod';
import prisma from '../config/prisma.js';
import { sendError, sendSuccess } from '../utils/response.js';
import { slugify } from '../utils/slugify.js';
import { extractYouTubeId } from '../utils/youtube.js';

export const videoSchema = z.object({
  title: z.string().min(3, 'Judul video minimal 3 karakter').max(200),
  youtubeUrl: z.string().url('URL YouTube tidak valid'),
  description: z.string().min(5, 'Deskripsi video minimal 5 karakter'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  allowedRoleIds: z.array(z.string()).min(1, 'Minimal pilih satu role yang diizinkan mengakses video ini'),
});

export const updateVideoSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  youtubeUrl: z.string().url().optional(),
  description: z.string().min(5).optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  allowedRoleIds: z.array(z.string()).optional(),
});

/**
 * Public/User: Get videos filtered by user role and query parameters
 */
export async function getVideos(req, res, next) {
  try {
    const user = req.user;
    const { category, search, page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const isAdmin = user?.role?.name === 'ADMIN';

    // Must be logged in and active to see videos
    if (!isAdmin) {
      if (!user || user.status !== 'ACTIVE' || !user.roleId) {
        return sendError(res, 'Anda harus login dengan akun aktif untuk melihat video.', 403);
      }
    }

    const where = {
      status: 'PUBLISHED',
    };

    // Filter by user role if not ADMIN
    if (!isAdmin) {
      where.allowedRoles = {
        some: {
          roleId: user.roleId,
        },
      };
    }

    // Filter by category slug or id if specified
    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
        { category: { parent: { slug: category } } },
      ];
    }

    // Filter by search query
    if (search && search.trim()) {
      const q = search.trim();
      where.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, parent: true },
          },
          allowedRoles: {
            include: {
              role: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.video.count({ where }),
    ]);

    return sendSuccess(res, 'Daftar video berhasil dimuat.', {
      videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public/User: Get single video by slug with role check
 */
export async function getVideoBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const user = req.user;

    const video = await prisma.video.findUnique({
      where: { slug },
      include: {
        category: {
          include: { parent: true },
        },
        allowedRoles: {
          include: {
            role: { select: { id: true, name: true, description: true } },
          },
        },
      },
    });

    if (!video) {
      return sendError(res, 'Video tidak ditemukan.', 404);
    }

    const isAdmin = user?.role?.name === 'ADMIN';

    // If DRAFT and not ADMIN -> return 404
    if (video.status === 'DRAFT' && !isAdmin) {
      return sendError(res, 'Video tidak ditemukan atau belum dipublikasikan.', 404);
    }

    // Role check if not ADMIN
    if (!isAdmin) {
      if (!user || user.status !== 'ACTIVE' || !user.roleId) {
        return sendError(res, 'Akses terbatas. Anda harus login dengan akun aktif untuk menonton video ini.', 403);
      }

      const hasAccess = video.allowedRoles.some((ar) => ar.roleId === user.roleId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN_ROLE',
          message: 'Video ini tidak tersedia untuk role akun Anda.',
        });
      }
    }

    // Related videos from the same category that user has access to
    const relatedWhere = {
      status: 'PUBLISHED',
      id: { not: video.id },
      categoryId: video.categoryId,
    };

    if (!isAdmin) {
      relatedWhere.allowedRoles = {
        some: {
          roleId: user.roleId,
        },
      };
    }

    const relatedVideos = await prisma.video.findMany({
      where: relatedWhere,
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });

    return sendSuccess(res, 'Detail video berhasil dimuat.', {
      video,
      relatedVideos,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public/User: Search videos strictly respecting role authorization
 */
export async function searchVideos(req, res, next) {
  try {
    const user = req.user;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return sendSuccess(res, 'Pencarian kosong.', { videos: [] });
    }

    const queryStr = q.trim();
    const isAdmin = user?.role?.name === 'ADMIN';

    if (!isAdmin) {
      if (!user || user.status !== 'ACTIVE' || !user.roleId) {
        return sendError(res, 'Silakan login terlebih dahulu untuk melakukan pencarian video.', 403);
      }
    }

    const where = {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: queryStr, mode: 'insensitive' } },
        { description: { contains: queryStr, mode: 'insensitive' } },
      ],
    };

    if (!isAdmin) {
      where.allowedRoles = {
        some: {
          roleId: user.roleId,
        },
      };
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        category: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, `Hasil pencarian untuk "${queryStr}"`, { videos });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get all videos (including DRAFT)
 */
export async function getAdminVideos(req, res, next) {
  try {
    const { status, categoryId, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && (status === 'DRAFT' || status === 'PUBLISHED')) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        include: {
          category: {
            include: { parent: true },
          },
          allowedRoles: {
            include: {
              role: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.video.count({ where }),
    ]);

    return sendSuccess(res, 'Daftar video admin berhasil dimuat.', {
      videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get single video by ID
 */
export async function getAdminVideoById(req, res, next) {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        category: true,
        allowedRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!video) {
      return sendError(res, 'Video tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data video berhasil diambil.', { video });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create video
 */
export async function createVideo(req, res, next) {
  try {
    const { title, youtubeUrl, description, categoryId, status, allowedRoleIds } = req.body;

    // Validate YouTube URL and extract ID
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return sendError(
        res,
        'URL YouTube tidak valid atau bukan dari domain YouTube resmi. Format yang didukung: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...',
        400
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return sendError(res, 'Kategori yang dipilih tidak ditemukan.', 400);
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `video-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.video.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create video with many-to-many role relation
    const newVideo = await prisma.video.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        youtubeUrl: youtubeUrl.trim(),
        youtubeId,
        description: description.trim(),
        categoryId,
        status: status || 'DRAFT',
        allowedRoles: {
          create: allowedRoleIds.map((roleId) => ({
            role: { connect: { id: roleId } },
          })),
        },
      },
      include: {
        category: true,
        allowedRoles: {
          include: { role: true },
        },
      },
    });

    return sendSuccess(res, 'Video berhasil ditambahkan.', { video: newVideo }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update video
 */
export async function updateVideo(req, res, next) {
  try {
    const { id } = req.params;
    const { title, youtubeUrl, description, categoryId, status, allowedRoleIds } = req.body;

    const existingVideo = await prisma.video.findUnique({
      where: { id },
      include: { allowedRoles: true },
    });

    if (!existingVideo) {
      return sendError(res, 'Video tidak ditemukan.', 404);
    }

    const updateData = {};

    if (title && title.trim() !== existingVideo.title) {
      updateData.title = title.trim();
      let baseSlug = slugify(title);
      let uniqueSlug = baseSlug;
      let counter = 1;
      while (
        await prisma.video.findFirst({
          where: { slug: uniqueSlug, id: { not: id } },
        })
      ) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = uniqueSlug;
    }

    if (youtubeUrl) {
      const youtubeId = extractYouTubeId(youtubeUrl);
      if (!youtubeId) {
        return sendError(res, 'URL YouTube tidak valid.', 400);
      }
      updateData.youtubeUrl = youtubeUrl.trim();
      updateData.youtubeId = youtubeId;
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return sendError(res, 'Kategori tidak ditemukan.', 400);
      }
      updateData.categoryId = categoryId;
    }

    if (status) {
      updateData.status = status;
    }

    // If allowedRoleIds is provided, update relation
    if (Array.isArray(allowedRoleIds) && allowedRoleIds.length > 0) {
      // Delete existing and recreate
      await prisma.videoRole.deleteMany({
        where: { videoId: id },
      });

      updateData.allowedRoles = {
        create: allowedRoleIds.map((roleId) => ({
          roleId,
        })),
      };
    }

    const updated = await prisma.video.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        allowedRoles: {
          include: { role: true },
        },
      },
    });

    return sendSuccess(res, 'Video berhasil diperbarui.', { video: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Delete video
 */
export async function deleteVideo(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Video tidak ditemukan.', 404);
    }

    await prisma.video.delete({ where: { id } });

    return sendSuccess(res, 'Video berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}
