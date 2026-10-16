import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  authSecret: process.env.AUTH_SECRET || 'fallback_development_secret_only_change_in_production_32chars',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};
