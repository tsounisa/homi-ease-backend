import http from 'http';
import 'dotenv/config';
import { app } from './app.js';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
