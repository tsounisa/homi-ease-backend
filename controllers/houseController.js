import * as houseService from '../services/houseService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller getHouses
 * @description Get all houses for the authenticated user.
 * @route GET /api/v1/houses
 * @access Private
 */
export const getHouses = async (req, res, next) => {
  try {
    const userId = req.user._id; // From protect middleware
    const houses = await houseService.getHousesForUser(userId);
    sendSuccessResponse(res, 200, 'Houses fetched successfully', houses);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller addHouse
 * @description Add a new house.
 * @route POST /api/v1/houses
 * @access Private
 */
export const addHouse = async (req, res, next) => {
  try {
    const userId = req.user._id; // From protect middleware
    const { name } = req.body;
    const house = await houseService.addHouse(userId, { name });
    sendSuccessResponse(res, 201, 'House added successfully', house);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller removeHouse
 * @description Remove a house.
 * @route DELETE /api/v1/houses/:houseId
 * @access Private
 */
export const removeHouse = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    const userId = req.user._id;
    const result = await houseService.removeHouse(houseId, userId);
    sendSuccessResponse(res, 200, 'House removed successfully', result);
  } catch (error) {
    next(error);
  }
};