import { z } from 'zod';
import prisma from '../config/prisma.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const roleSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama role minimal 2 karakter')
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Nama role harus berupa huruf kapital, angka, dan underscore (contoh: PREMIUM_MEMBER)'),
  description: z.string().max(255).optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Nama role harus berupa huruf kapital, angka, dan underscore')
    .optional(),
  description: z.string().max(255).optional(),
});

/**
 * Admin: Get all roles
 */
export async function getRoles(req, res, next) {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            videoRoles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, 'Daftar role berhasil diambil.', { roles });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Create a new role
 */
export async function createRole(req, res, next) {
  try {
    const { name, description } = req.body;
    const upperName = name.trim().toUpperCase();

    const existing = await prisma.role.findUnique({ where: { name: upperName } });
    if (existing) {
      return sendError(res, `Role dengan nama ${upperName} sudah ada.`, 409);
    }

    const role = await prisma.role.create({
      data: {
        name: upperName,
        description: description?.trim() || null,
      },
    });

    return sendSuccess(res, 'Role berhasil dibuat.', { role }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update role
 */
export async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Role tidak ditemukan.', 404);
    }

    // Protect system ADMIN role from renaming
    if (existing.name === 'ADMIN' && name && name !== 'ADMIN') {
      return sendError(res, 'Nama role sistem ADMIN tidak boleh diubah.', 400);
    }

    const updateData = {};
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (name) {
      const upperName = name.trim().toUpperCase();
      if (upperName !== existing.name) {
        const nameExists = await prisma.role.findUnique({ where: { name: upperName } });
        if (nameExists) {
          return sendError(res, `Role dengan nama ${upperName} sudah ada.`, 409);
        }
        updateData.name = upperName;
      }
    }

    const updated = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 'Role berhasil diperbarui.', { role: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Delete role
 */
export async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            videoRoles: true,
          },
        },
      },
    });

    if (!existing) {
      return sendError(res, 'Role tidak ditemukan.', 404);
    }

    if (existing.name === 'ADMIN') {
      return sendError(res, 'Role ADMIN adalah role sistem dan tidak boleh dihapus.', 400);
    }

    if (existing._count.users > 0) {
      return sendError(
        res,
        `Tidak dapat menghapus role karena masih digunakan oleh ${existing._count.users} pengguna. Ubah role pengguna terlebih dahulu.`,
        400
      );
    }

    await prisma.role.delete({ where: { id } });

    return sendSuccess(res, 'Role berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}
