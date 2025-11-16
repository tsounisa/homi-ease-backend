import * as roomService from '../services/roomService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller getRooms
 * @description Get all rooms for a specific house.
 * @route GET /api/v1/houses/:houseId/rooms
 * @access Private
 */
export const getRooms = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    const rooms = await roomService.getRoomsInHouse(houseId);
    sendSuccessResponse(res, 200, 'Rooms fetched successfully', rooms);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller addRoomToHouse
 * @description Add a room to a house.
 * @route POST /api/v1/houses/:houseId/rooms
 * @access Private
 */
export const addRoomToHouse = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    const { name } = req.body;
    // TODO: Add check to ensure user owns this house
    const room = await roomService.addRoomToHouse(houseId, { name });
    sendSuccessResponse(res, 201, 'Room added successfully', room);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller removeRoom
 * @description Remove a room.
 * @route DELETE /api/v1/rooms/:roomId
 * @access Private
 */
export const removeRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    // TODO: Add check to ensure user owns this room
    const result = await roomService.removeRoom(roomId);
    sendSuccessResponse(res, 200, 'Room removed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller setRoomTemperature
 * @description Set room temperature.
 * @route PUT /api/v1/rooms/:roomId/temperature
 * @access Private
 */
export const setRoomTemperature = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { temperature } = req.body;
    const settings = await roomService.setRoomTemperature(roomId, temperature);
    sendSuccessResponse(res, 200, 'Temperature set', settings);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller controlRoomLighting
 * @description Control lighting of a room.
 * @route PUT /api/v1/rooms/:roomId/lighting
 * @access Private
 */
export const controlRoomLighting = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const lightingData = req.body; // e.g., { isOn, brightness }
    const settings = await roomService.controlRoomLighting(
      roomId,
      lightingData
    );
    sendSuccessResponse(res, 200, 'Lighting set', settings);
  } catch (error) {
    next(error);
  }
};