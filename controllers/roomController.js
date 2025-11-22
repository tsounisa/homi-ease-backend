import * as roomService from '../services/roomService.js';
import { sendSuccessResponse } from '../utils/responses.js';

export const getRooms = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    const rooms = await roomService.getRoomsInHouse(houseId);
    sendSuccessResponse(res, 200, 'Rooms fetched successfully', rooms);
  } catch (error) {
    next(error);
  }
};

export const addRoomToHouse = async (req, res, next) => {
  try {
    const { houseId } = req.params;
    const { name } = req.body;
    const room = await roomService.addRoomToHouse(houseId, { name });
    sendSuccessResponse(res, 201, 'Room added successfully', room);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller updateRoomDetails
 * @description Update room (e.g. name). Matches PUT /rooms/:roomId
 */
export const updateRoomDetails = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const updates = req.body;
    const room = await roomService.updateRoom(roomId, updates);
    sendSuccessResponse(res, 200, 'Room updated successfully', room);
  } catch (error) {
    next(error);
  }
};

export const removeRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const result = await roomService.removeRoom(roomId);
    sendSuccessResponse(res, 200, 'Room removed successfully', result);
  } catch (error) {
    next(error);
  }
};

// (Keep existing temp/lighting controllers if you want, but we focus on updateRoomDetails)
export const setRoomTemperature = async (req, res, next) => { /* ... */ };
export const controlRoomLighting = async (req, res, next) => { /* ... */ };