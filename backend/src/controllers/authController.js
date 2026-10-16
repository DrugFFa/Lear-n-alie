import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/env.js';
import prisma from '../config/prisma.js';
import { sendError, sendSuccess } from '../utils/response.js';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
    email: z.string().email('Format email tidak valid').max(255),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

/**
 * Register a new user
 * New users are always created with status PENDING and no assigned role
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return sendError(res, 'Email sudah terdaftar. Silakan gunakan email lain atau login.', 409);
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with PENDING status
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        status: 'PENDING',
        roleId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return sendSuccess(
      res,
      'Registrasi berhasil! Akun Anda saat ini menunggu persetujuan dari administrator.',
      { user: newUser },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        role: true,
      },
    });

    if (!user) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
      },
      config.authSecret,
      { expiresIn: '7d' }
    );

    // Set secure cookie
    const isProduction = config.nodeEnv === 'production';
    res.cookie('learnalie_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
          }
        : null,
    };

    let message = 'Login berhasil.';
    if (user.status === 'PENDING') {
      message = 'Login berhasil, namun akun Anda masih menunggu persetujuan administrator.';
    } else if (user.status === 'SUSPENDED') {
      message = 'Akun Anda ditangguhkan.';
    }

    return sendSuccess(res, message, {
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  const isProduction = config.nodeEnv === 'production';
  res.clearCookie('learnalie_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  return sendSuccess(res, 'Logout berhasil.');
}

/**
 * Get current authenticated user profile
 */
export async function getMe(req, res) {
  const user = req.user;
  return sendSuccess(res, 'Data pengguna berhasil diambil.', {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
          }
        : null,
      createdAt: user.createdAt,
    },
  });
}
