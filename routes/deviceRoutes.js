import { Router } from 'express';
import {
  removeDevice,
  categorizeDevice,
  getDeviceStatus,
  controlDevice,
  getAvailableDevices, // Import the new controller function
} from '../controllers/deviceController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// All device routes are protected
router.use(protect);

// @route   GET /api/v1/devices/available
// @desc    Get all available devices for the authenticated user
// @access  Private
router.get('/available', getAvailableDevices); // New route

// @route   DELETE /api/v1/devices/:deviceId
// @desc    Remove smart device
// @access  Private
router.delete('/:deviceId', removeDevice);

// @route   PUT /api/v1/devices/:deviceId
// @desc    Categorize a smart device
// @access  Private
router.put('/:deviceId', validate(), categorizeDevice);

// @route   GET /api/v1/devices/:deviceId/status
// @desc    Communicate with smart device (get status)
// @access  Private
router.get('/:deviceId/status', getDeviceStatus);

// @route   POST /api/v1/devices/:deviceId/action
// @desc    Control smart device manually
// @access  Private
router.post('/:deviceId/action', validate(), controlDevice);

export default router;