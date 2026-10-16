import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching frontend
      if (!origin || origin === config.frontendOrigin || origin === 'http://localhost:5173') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development, can restrict in production
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Lear(n)alie API — Learn something new, your way.',
    version: '1.1',
    docs: '/api/health',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
