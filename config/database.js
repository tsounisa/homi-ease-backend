import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { loadMockData } from './mockData.js';
import { DB_NAME } from './constants.js';

/**
 * Global database state object.
 * Services will check `db.isConnected` to decide
 * whether to use Mongoose (true) or mock data (false).
 */
export const db = {
  isConnected: false,
};

/**
 * @function connectDB
 * @description Connects to MongoDB if URI is provided,
 * otherwise loads mock data.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      const connectionInstance = await mongoose.connect(
        `${mongoUri}/${DB_NAME}`
      );
      db.isConnected = true;
      logger.info(
        `MongoDB connected! DB Host: ${connectionInstance.connection.host}`
      );
    } catch (error) {
      logger.error('MongoDB connection failed:', error.message);
      logger.warn('Falling back to mock data mode.');
      db.isConnected = false;
    }
  } else {
    logger.warn('MONGODB_URI not found. Running in mock data mode.');
    db.isConnected = false;
  }

  // If not connected to a live DB, load the in-memory mock data.
  if (!db.isConnected) {
    loadMockData();
    logger.info('In-memory mock database initialized.');
  }
};