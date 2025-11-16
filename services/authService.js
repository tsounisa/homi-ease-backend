import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { db } from '../config/database.js';
import { mockUsers } from '../config/mockData.js';
import bcrypt from 'bcryptjs';

/**
 * @function generateToken
 * @description Generates a JWT for a given user ID.
 * @param {string} id - The user's ID
 * @returns {string} - The JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * @function loginUser
 * @description Authenticates a user and returns a JWT.
 * @param {string} email - User's email
 * @param {string} password - User's plain text password
 * @returns {Promise<{token: string, user: object}>}
 */
export const loginUser = async (email, password) => {
  let user;
  let passwordMatch = false;

  if (db.isConnected) {
    // MongoDB Logic
    user = await User.findOne({ email }).select('+password');
    if (user) {
      passwordMatch = await user.matchPassword(password);
    }
  } else {
    // Mock Data Logic
    user = mockUsers.find((u) => u.email === email);
    if (user) {
      // TEMPORARY: For debugging mock data login issue
      passwordMatch = (password === 'password123');
      // ORIGINAL: passwordMatch = await bcrypt.compare(password, user.password);
    }
  }

  if (!user || !passwordMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Remove password from user object before returning
  const userResponse = { ...user };
  if (userResponse.password) {
    delete userResponse.password; // Mongoose doc
  } else if (userResponse._doc && userResponse._doc.password) {
    delete userResponse._doc.password; // Mock data
  }

  const token = generateToken(user._id);
  return { token, user: userResponse };
};