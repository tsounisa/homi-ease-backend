import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { db } from '../config/database.js';
import { mockUsers } from '../config/mockData.js';

/**
 * @function getUserById
 * @async
 * @description Retrieves a user's profile information by their ID.
 * Automatically excludes sensitive authentication fields in the DB path
 * (though the Model definition usually handles this, we explicitly handle 404s).
 *
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<Object>} The user profile object.
 * @throws {ApiError} 404 - If the user is not found.
 */
export const getUserById = async (userId) => {
  if (db.isConnected) {
    // Database Path: Mongoose findById
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  } else {
    // Mock Data Path: Array find
    const user = mockUsers.find((u) => u._id === userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
};