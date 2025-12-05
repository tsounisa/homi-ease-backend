import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { db } from '../config/database.js';
import { mockUsers } from '../config/mockData.js';

/**
 * @function getUserById
 * @async
 * @description Retrieves a user's profile information by their ID.
 * explicitly sanitizes the response to remove sensitive fields like passwords.
 *
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<Object>} The sanitized user profile object.
 * @throws {ApiError} 404 - If the user is not found.
 */
export const getUserById = async (userId) => {
  let user;

  if (db.isConnected) {
    // Database Path: Mongoose findById
    // Note: Schema 'select: false' usually handles this, but explicit removal is safer
    user = await User.findById(userId);
  } else {
    // Mock Data Path: Array find
    user = mockUsers.find((u) => u._id === userId);
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // --- SECURITY SANITIZATION ---
  // Convert Mongoose document to plain object if necessary
  const userResponse = user.toObject ? user.toObject() : { ...user };
  
  // Explicitly delete password
  delete userResponse.password;

  return userResponse;
};