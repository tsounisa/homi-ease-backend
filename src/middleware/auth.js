import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { mockUsers } from '../config/mockData.js';
import { db } from '../config/database.js';

/**
 * @function protect
 * @description Middleware to protect routes.
 * Verifies JWT token and attaches user to req object.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1) Check if token exists and is in the correct format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError(401, 'You are not logged in. Please log in to get access.')
    );
  }

  try {
    // 2) Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    let currentUser;
    if (db.isConnected) {
      // Use MongoDB
      currentUser = await User.findById(decoded.id);
    } else {
      // Use Mock Data
      currentUser = mockUsers.find((user) => user._id === decoded.id);
    }

    if (!currentUser) {
      return next(
        new ApiError(
          401,
          'The user belonging to this token no longer exists.'
        )
      );
    }

    // 4) Grant access: Attach user to the request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your token has expired.'));
    }
    next(new ApiError(401, 'Not authorized.'));
  }
};