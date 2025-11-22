import { Router } from 'express';
import {
  removeRoom,
  updateRoomDetails, // <-- Import this
  setRoomTemperature,
  controlRoomLighting,
} from '../controllers/roomController.js';
import { addDeviceToRoom, getDevices } from '../controllers/deviceController.js'; 
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.use(protect);

// @route   PUT /api/v1/rooms/:roomId
// @desc    Update room details (Rename)
// @access  Private
router.put('/:roomId', validate(), updateRoomDetails); // <-- SWAGGER COMPLIANT

// @route   DELETE /api/v1/rooms/:roomId
// @desc    Remove a room
router.delete('/:roomId', removeRoom);

// (Extra features - Optional for now)
router.put('/:roomId/temperature', validate(), setRoomTemperature);
router.put('/:roomId/lighting', validate(), controlRoomLighting);

// Nested Device Routes
router.get('/:roomId/devices', getDevices);
router.post('/:roomId/devices', validate(), addDeviceToRoom);

export default router;