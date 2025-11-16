import { Router } from 'express';
import {
  removeRoom,
  setRoomTemperature,
  controlRoomLighting,
} from '../controllers/roomController.js';
import { addDeviceToRoom, getDevices } from '../controllers/deviceController.js'; // Import getDevices
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// All room routes are protected
router.use(protect);

// @route   DELETE /api/v1/rooms/:roomId
// @desc    Remove a room
// @access  Private
router.delete('/:roomId', removeRoom);

// @route   PUT /api/v1/rooms/:roomId/temperature
// @desc    Set room temperature
// @access  Private
router.put('/:roomId/temperature', validate(), setRoomTemperature);

// @route   PUT /api/v1/rooms/:roomId/lighting
// @desc    Control lighting of a room
// @access  Private
router.put('/:roomId/lighting', validate(), controlRoomLighting);

// @route   GET /api/v1/rooms/:roomId/devices
// @desc    Get all devices for a specific room
// @access  Private
router.get('/:roomId/devices', getDevices); // Add this GET route

// @route   POST /api/v1/rooms/:roomId/devices
// @desc    Add smart device to room
// @access  Private
// This nested route is logically placed here
router.post('/:roomId/devices', validate(), addDeviceToRoom);

export default router;