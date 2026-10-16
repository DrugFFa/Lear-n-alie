import { sendError } from '../utils/response.js';

export const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} tidak ditemukan`, 404);
};

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};
