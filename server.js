import http from 'http';
import 'dotenv/config'; // Load .env file
import { app } from './app.js';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

/**
 * @function startServer
 * @description Initializes database connection and starts the Express server.
 */
const startServer = async () => {
  try {
    // Attempt to connect to MongoDB
    // connectDB will handle the logic for mock data fallback
    await connectDB();

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

startServer();