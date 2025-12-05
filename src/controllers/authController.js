import * as authService from '../services/authService.js';
import * as userService from '../services/userService.js';
import { sendSuccessResponse } from '../utils/responses.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    sendSuccessResponse(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    sendSuccessResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by the 'protect' middleware
    const user = await userService.getUserById(req.user._id);
    sendSuccessResponse(res, 200, 'User data retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};