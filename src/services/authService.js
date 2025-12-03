import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { db } from '../config/database.js';
import { mockUsers } from '../config/mockData.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // Added for mock ID generation

/**
 * @function generateToken
 * @description Generates a JWT for a given user ID.
 * @param {string} id - The user's ID
 * @returns {string} - The JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'testsecret123', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * @function registerUser
 * @description Registers a new user (DB or Mock) and returns token.
 * @param {object} userData - { name, email, password }
 * @returns {Promise<{token: string, user: object}>}
 */
export const registerUser = async (userData) => {
  const { name, email, password } = userData;
  let user;

  if (db.isConnected) {
    // --- DB PATH ---
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    // Create user (Mongoose pre-save hook handles hashing)
    user = await User.create({ name, email, password });
  } else {
    // --- MOCK PATH ---
    const userExists = mockUsers.find((u) => u.email === email);
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    // Manual hashing for mock data
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = {
      _id: `user-${uuidv4()}`,
      name,
      email,
      password: hashedPassword,
      houses: [],
      createdAt: new Date(),
    };
    mockUsers.push(user);
  }

  // Prepare response (remove password)
  const userResponse = { ...user };
  if (userResponse._doc) {
    // Mongoose document
    delete userResponse._doc.password;
    // userResponse._doc usually effectively spreads into the object depending on Mongoose version, 
    // but explicit assignment is safer for response:
    Object.assign(userResponse, userResponse._doc);
  }
  delete userResponse.password;

  const token = generateToken(user._id);
  return { token, user: userResponse };
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
    // MongoDB Logic: Explicitly select password to compare
    user = await User.findOne({ email }).select('+password');
    if (user) {
      passwordMatch = await user.matchPassword(password);
    }
  } else {
    // Mock Data Logic
    user = mockUsers.find((u) => u.email === email);
    if (user) {
      passwordMatch = await bcrypt.compare(password, user.password);
    }
  }

  if (!user || !passwordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Remove password from user object before returning
  const userResponse = { ...user };
  if (userResponse.password) delete userResponse.password;
  if (userResponse._doc && userResponse._doc.password) delete userResponse._doc.password;

  const token = generateToken(user._id);
  return { token, user: userResponse };
};