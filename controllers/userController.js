import * as userService from '../services/userService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller createUser
 * @description Creates a new user account.
 * @route POST /api/v1/users
 * @access Public
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await userService.createUser({ name, email, password });
    // In a real app, you'd also log them in (i.e., return a token)
    sendSuccessResponse(res, 201, 'User created successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getUserStatistics
 * @description View statistics for a user.
 * @route GET /api/v1/users/:userId/statistics
 * @access Private
 */
export const getUserStatistics = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // TODO: Add check to ensure req.user.id === userId or req.user.isAdmin
    const stats = await userService.getUserStatistics(userId);
    sendSuccessResponse(res, 200, 'Statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller sendNotification
 * @description Send a notification to a user.
 * @route POST /api/v1/users/:userId/notifications
 * @access Private (Admin/System)
 */
export const sendNotification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    const result = await userService.sendNotification(userId, { message });
    sendSuccessResponse(res, 200, 'Notification sent', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller customizeHomeScreen
 * @description Customize the user's home screen.
 * @route PUT /api/v1/users/:userId/home
 * @access Private
 */
export const customizeHomeScreen = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const settings = req.body;
    const result = await userService.customizeHomeScreen(userId, settings);
    sendSuccessResponse(res, 200, 'Home screen customized', result);
  } catch (error) {
    next(error);
  }
};

export const addWidget = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const widgetData = req.body;
    const widget = await userService.addWidget(userId, widgetData);
    sendSuccessResponse(res, 201, 'Widget added', widget);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getMe
 * @description Get the current user's data.
 * @route GET /api/v1/users/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by the 'protect' middleware
    const user = await userService.getUserById(req.user._id);
    sendSuccessResponse(res, 200, 'User data retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};