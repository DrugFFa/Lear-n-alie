import app from './app.js';
import { config } from './config/env.js';
import prisma from './config/prisma.js';

const PORT = config.port;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Lear(n)alie backend running on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.log('⚠️  Starting server in degraded mode (API endpoints waiting for DB)...');
    app.listen(PORT, () => {
      console.log(`🚀 Lear(n)alie backend running on http://localhost:${PORT} (Database pending)`);
    });
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma disconnected, exiting process.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
