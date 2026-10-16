import { z } from 'zod';
import prisma from '../config/prisma.js';
import { sendError, sendSuccess } from '../utils/response.js';
import { slugify } from '../utils/slugify.js';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(100),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

/**
 * Public/User: List all categories with their subcategories
 */
export async function getCategories(req, res, next) {
  try {
    // Fetch top-level categories (parentId is null) with subcategories
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        subcategories: {
          include: {
            _count: {
              select: {
                videos: {
                  where: { status: 'PUBLISHED' },
                },
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            videos: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, 'Daftar kategori berhasil diambil.', { categories });
  } catch (error) {
    next(error);
  }
}

/**
 * Public/User: Get single category by slug with allowed videos for current user
 */
export async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const user = req.user; // from optionalAuth or requireAuth

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        subcategories: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!category) {
      return sendError(res, 'Kategori tidak ditemukan.', 404);
    }

    // Determine allowed video roles condition
    let videoWhere = {
      status: 'PUBLISHED',
      OR: [
        { categoryId: category.id },
        { category: { parentId: category.id } },
      ],
    };

    // If user is ADMIN, can see all
    const isAdmin = user?.role?.name === 'ADMIN';

    if (!isAdmin) {
      if (!user || user.status !== 'ACTIVE' || !user.roleId) {
        // Guest or inactive or no role: cannot see protected videos
        return sendError(res, 'Akses terbatas. Anda harus login dengan akun aktif untuk melihat konten ini.', 403);
      }

      // User must match role in video_roles
      videoWhere.allowedRoles = {
        some: {
          roleId: user.roleId,
        },
      };
    }

    const videos = await prisma.video.findMany({
      where: videoWhere,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Kategori berhasil dimuat.', {
      category,
      videos,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get flat or hierarchical category list for management
 */
export async function getAdminCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            subcategories: true,
            videos: true,
          },
        },
      },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });

    return sendSuccess(res, 'Data kategori admin berhasil diambil.', { categories });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create category or subcategory
 */
export async function createCategory(req, res, next) {
  try {
    const { name, parentId } = req.body;
    let baseSlug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    if (!baseSlug) {
      baseSlug = `kategori-${Date.now()}`;
    }

    // Ensure unique slug
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // If parentId provided, verify it exists and is not a subcategory itself to prevent deep nesting
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return sendError(res, 'Kategori induk tidak ditemukan.', 400);
      }
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        parentId: parentId || null,
      },
      include: {
        parent: true,
      },
    });

    return sendSuccess(res, 'Kategori berhasil ditambahkan.', { category }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update category
 */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Kategori tidak ditemukan.', 404);
    }

    // Circular hierarchy check
    if (parentId && parentId === id) {
      return sendError(res, 'Kategori tidak boleh menjadi induk untuk dirinya sendiri.', 400);
    }

    const updateData = {};
    if (name) updateData.name = name.trim();

    if (req.body.slug) {
      const newSlug = slugify(req.body.slug);
      if (newSlug !== existing.slug) {
        const slugExists = await prisma.category.findUnique({ where: { slug: newSlug } });
        if (slugExists) {
          return sendError(res, 'Slug kategori sudah digunakan.', 409);
        }
        updateData.slug = newSlug;
      }
    }

    if (parentId !== undefined) {
      if (parentId) {
        const parent = await prisma.category.findUnique({ where: { id: parentId } });
        if (!parent) {
          return sendError(res, 'Kategori induk tidak ditemukan.', 400);
        }
      }
      updateData.parentId = parentId || null;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: { parent: true },
    });

    return sendSuccess(res, 'Kategori berhasil diperbarui.', { category: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Delete category
 */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            videos: true,
            subcategories: true,
          },
        },
      },
    });

    if (!category) {
      return sendError(res, 'Kategori tidak ditemukan.', 404);
    }

    if (category._count.videos > 0) {
      return sendError(
        res,
        `Tidak dapat menghapus kategori karena masih digunakan oleh ${category._count.videos} video. Pindahkan atau hapus video terlebih dahulu.`,
        400
      );
    }

    if (category._count.subcategories > 0) {
      return sendError(
        res,
        `Tidak dapat menghapus kategori karena memiliki ${category._count.subcategories} subkategori. Hapus atau pindahkan subkategori terlebih dahulu.`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });

    return sendSuccess(res, 'Kategori berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}
