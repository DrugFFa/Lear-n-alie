import { z } from 'zod';
import prisma from '../config/prisma.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const updateRoleSchema = z.object({
  roleId: z.string().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']),
});

/**
 * Admin: Get user list with filtering and pagination
 */
export async function getUsers(req, res, next) {
  try {
    const { status, roleId, search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && ['PENDING', 'ACTIVE', 'SUSPENDED'].includes(status)) {
      where.status = status;
    }

    if (roleId) {
      where.roleId = roleId === 'none' ? null : roleId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          roleId: true,
          role: {
            select: { id: true, name: true, description: true },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    return sendSuccess(res, 'Daftar pengguna berhasil dimuat.', {
      users,
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
 * Admin: Assign or change user role
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!targetUser) {
      return sendError(res, 'Pengguna tidak ditemukan.', 404);
    }

    // Safety: prevent admin from un-admining themselves
    if (req.user.id === id && targetUser.role?.name === 'ADMIN') {
      const newRole = roleId ? await prisma.role.findUnique({ where: { id: roleId } }) : null;
      if (!newRole || newRole.name !== 'ADMIN') {
        return sendError(res, 'Anda tidak dapat menghapus hak ADMIN dari akun Anda sendiri.', 400);
      }
    }

    if (roleId) {
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        return sendError(res, 'Role yang dipilih tidak ditemukan.', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { roleId: roleId || null },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        roleId: true,
        role: true,
      },
    });

    return sendSuccess(res, 'Role pengguna berhasil diperbarui.', { user: updatedUser });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update user status (approve, suspend, or reset to pending)
 */
export async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!targetUser) {
      return sendError(res, 'Pengguna tidak ditemukan.', 404);
    }

    // Safety: prevent admin from suspending themselves
    if (req.user.id === id && status === 'SUSPENDED') {
      return sendError(res, 'Anda tidak dapat menangguhkan akun Anda sendiri.', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        roleId: true,
        role: true,
      },
    });

    let statusText = 'diperbarui';
    if (status === 'ACTIVE') statusText = 'disetujui dan diaktifkan';
    else if (status === 'SUSPENDED') statusText = 'ditangguhkan';
    else if (status === 'PENDING') statusText = 'dikembalikan ke status menunggu persetujuan';

    return sendSuccess(res, `Akun pengguna berhasil ${statusText}.`, { user: updatedUser });
  } catch (error) {
    next(error);
  }
}
