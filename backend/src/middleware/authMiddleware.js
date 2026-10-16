import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import prisma from '../config/prisma.js';
import { sendError } from '../utils/response.js';

/**
 * Extracts JWT token from Authorization header or cookie
 */
function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.learnalie_token) {
    return req.cookies.learnalie_token;
  }
  return null;
}

/**
 * Require valid authenticated session
 */
export const requireAuth = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return sendError(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', 401);
  }

  try {
    const decoded = jwt.verify(token, config.authSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      return sendError(res, 'Sesi tidak valid. Pengguna tidak ditemukan.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Sesi telah berakhir, silakan login kembali.', 401);
    }
    return sendError(res, 'Token autentikasi tidak valid.', 401);
  }
};

/**
 * Optional authentication middleware: if token present and valid, attaches req.user, otherwise continues as guest
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.authSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
};

/**
 * Ensures user is ACTIVE (not PENDING or SUSPENDED)
 */
export const requireActive = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Autentikasi diperlukan.', 401);
  }

  if (req.user.status === 'PENDING') {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_PENDING',
      message: 'Akun Anda sedang menunggu persetujuan administrator.',
    });
  }

  if (req.user.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_SUSPENDED',
      message: 'Akun Anda telah ditangguhkan. Silakan hubungi administrator.',
    });
  }

  if (req.user.status !== 'ACTIVE') {
    return sendError(res, 'Status akun tidak valid untuk mengakses konten.', 403);
  }

  next();
};

/**
 * Check if user has specific role (ADMIN always has full access)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Autentikasi diperlukan.', 401);
    }

    const userRoleName = req.user.role?.name;

    // ADMIN always has full access
    if (userRoleName === 'ADMIN') {
      return next();
    }

    if (!userRoleName || !allowedRoles.includes(userRoleName)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan atau konten ini.',
      });
    }

    next();
  };
};

/**
 * Convenience middleware for ADMIN-only routes
 */
export const requireAdmin = [requireAuth, requireActive, requireRole('ADMIN')];
