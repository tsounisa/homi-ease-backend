import * as userService from '../services/userService.js';
import { sendSuccessResponse } from '../utils/responses.js';



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