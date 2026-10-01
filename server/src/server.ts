import app from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/prisma.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

async function bootstrap() {
  await checkDatabaseConnection();

  app.listen(PORT, () => {
    logger.info(`=======================================================`);
    logger.info(` KING DAY STORE API Server running on port ${PORT}`);
    logger.info(` Mode: ${env.NODE_ENV}`);
    logger.info(` Domain: https://www.king-day.shop`);
    logger.info(` WhatsApp Support: +91 9495902904`);
    logger.info(`=======================================================`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start KING DAY server:', err);
  process.exit(1);
});
