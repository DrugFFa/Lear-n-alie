import { sendError } from '../utils/response.js';

export const validate = (schema) => (req, res, next) => {
  try {
    // Validate req.body directly, with fallback to wrapped { body, query, params } if needed
    let result = schema.safeParse(req.body);
    let isWrapped = false;

    if (!result.success) {
      const wrappedResult = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (wrappedResult.success) {
        result = wrappedResult;
        isWrapped = true;
      }
    }

    if (!result.success) {
      const errorMap = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        errorMap[path] = err.message;
      });

      return sendError(res, 'Validasi gagal, silakan periksa input Anda.', 422, errorMap);
    }

    if (isWrapped) {
      if (result.data.body) req.body = result.data.body;
      if (result.data.query) req.query = result.data.query;
      if (result.data.params) req.params = result.data.params;
    } else {
      req.body = result.data;
    }

    next();
  } catch (error) {
    return sendError(res, 'Terjadi kesalahan pada validasi data.', 500);
  }
};
