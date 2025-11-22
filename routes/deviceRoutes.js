import { Router } from 'express';
import {
  getDevice, // <-- NEW IMPORT
  updateDeviceDetails,
  removeDevice
} from '../controllers/deviceController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.use(protect);

// @route   GET /api/v1/devices/:deviceId
// @desc    Get smart device details
router.get('/:deviceId', getDevice); // <-- Clean RESTful GET

// @route   PUT /api/v1/devices/:deviceId
// @desc    Update device details
router.put('/:deviceId', validate(), updateDeviceDetails);

// @route   DELETE /api/v1/devices/:deviceId
// @desc    Remove smart device
router.delete('/:deviceId', removeDevice);

export default router;