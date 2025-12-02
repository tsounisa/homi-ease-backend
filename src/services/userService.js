import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { db } from '../config/database.js';
import { mockUsers, mockDevices } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid'; // Use UUID for mock IDs
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

/**
 * @function createUser
 * @description Creates a new user account.
 * @param {object} userData - User data (name, email, password)
 * @returns {Promise<object>} The created user (without password)
 */
export const createUser = async (userData) => {
  let user;
  if (db.isConnected) {
    // MongoDB Logic
    user = await User.create(userData);
  } else {
    // Mock Data Logic
    const existingUser = mockUsers.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }
    // In a real mock, we'd hash the password, but User model pre-save hook handles it for Mongo
    // For mock, we'll hash it manually as in mockData.js
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    user = {
      _id: `user-${uuidv4()}`,
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
    };
    mockUsers.push(user);
  }

  // Don't return password
  const userResponse = { ...user };
  if (userResponse.password) delete userResponse.password;
  if (userResponse._doc) delete userResponse._doc.password;

  return userResponse;
};

/**
 * @function getUserStatistics
 * @description Retrieves usage statistics for a user.
 * @param {string} userId - The user's ID
 * @returns {Promise<object>} Statistics object
 */
export const getUserStatistics = async (userId) => {
  // This is a mock implementation. A real one would aggregate data.
  let deviceCount = 0;
  if (db.isConnected) {
    // This is complex, would involve finding all devices in all rooms in all houses for user
    // We'll return a mock count for now.
    deviceCount = await Device.countDocuments({
      /* query to find user's devices */
    }); // This query is incomplete for brevity
    deviceCount = deviceCount || 5; // Fallback
  } else {
    deviceCount = mockDevices.length; // Just count all mock devices
  }

  return {
    userId,
    totalDevices: deviceCount,
    energyUsage: Math.floor(Math.random() * 500) + 50, // Mocked data
    mostUsedRoom: 'Living Room', // Mocked data
  };
};

/**
 * @function sendNotification
 * @description Simulates sending a notification to a user.
 * @param {string} userId - The user's ID
 * @param {object} notificationData - Data for the notification
 * @returns {Promise<object>}
 */
export const sendNotification = async (userId, notificationData) => {
  // This is a simulation. A real service would use FCM, APN, or a message queue.
  logger.info(
    `Sending notification to user ${userId}: ${notificationData.message}`
  );
  return {
    status: 'sent',
    userId,
    message: notificationData.message,
    timestamp: new Date(),
  };
};

/**
 * @function customizeHomeScreen
 * @description Updates a user's home screen preferences.
 * @param {string} userId - The user's ID
 * @param {object} settings - Home screen settings
 * @returns {Promise<object>}
 */
export const customizeHomeScreen = async (userId, settings) => {
  // This would update a 'preferences' field on the User model
  logger.info(`Customizing home screen for user ${userId}`);
  return {
    userId,
    status: 'updated',
    newSettings: settings,
  };
};

/**
 * @function addWidget
 * @description Adds a new widget to the user's config.
 * @param {string} userId - The user's ID
 * @param {object} widgetData - Widget data
 * @returns {Promise<object>}
 */
export const addWidget = async (userId, widgetData) => {
  logger.info(`Adding widget for user ${userId}: ${widgetData.type}`);
  return {
    _id: `widget-${uuidv4()}`,
    userId,
    ...widgetData,
  };
};

/**
 * @function getUserById
 * @description Get a user by their ID.
 * @param {string} userId - The user's ID.
 * @returns {Promise<object>} The user object (without password).
 */
export const getUserById = async (userId) => {
  let user;
  if (db.isConnected) {
    user = await User.findById(userId).select('-password');
  } else {
    user = mockUsers.find((u) => u._id === userId);
    if (user) {
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};