import { Router } from 'express';
import {
  getDeviceStatus,
  updateDeviceDetails,
  removeDevice
} from '../controllers/deviceController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.use(protect);

// @route   GET /api/v1/devices/:deviceId/status
// @desc    Get smart device status
router.get('/:deviceId/status', getDeviceStatus);

// @route   PUT /api/v1/devices/:deviceId
// @desc    Update device details
router.put('/:deviceId', validate(), updateDeviceDetails);

// @route   DELETE /api/v1/devices/:deviceId
// @desc    Remove smart device
router.delete('/:deviceId', removeDevice);

export default router;