import * as authService from '../services/authService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller login
 * @description Logs in a user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);

    // Note: In production, send the token in a secure, httpOnly cookie.
    // For this REST API, sending in the body is standard.
    sendSuccessResponse(res, 200, 'Login successful', { token, user });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};

/**
 * @controller register
 * @description Creates a new user account (wrapper for userController.createUser)
 * @route POST /api/v1/users
 * @access Public
 */
// This logic is in userController, but authController is a good place
// to group auth-related functions. We'll keep the actual logic
// in userController as per the OpenAPI spec path.