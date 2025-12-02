import { Router } from 'express';
import {
  removeRoom,
  updateRoomDetails,
  getRoom // <-- NEW IMPORT
} from '../controllers/roomController.js';
import { addDeviceToRoom, getDevices } from '../controllers/deviceController.js'; 
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.use(protect);

// @route   GET /api/v1/rooms/:roomId
// @desc    Get room details
router.get('/:roomId', getRoom); // <-- NEW ROUTE

// @route   PUT /api/v1/rooms/:roomId
// @desc    Update room details (Rename)
router.put('/:roomId', validate(), updateRoomDetails);

// @route   DELETE /api/v1/rooms/:roomId
// @desc    Remove a room
router.delete('/:roomId', removeRoom);

// Nested Device Routes
router.get('/:roomId/devices', getDevices);
router.post('/:roomId/devices', validate(), addDeviceToRoom);

export default router;