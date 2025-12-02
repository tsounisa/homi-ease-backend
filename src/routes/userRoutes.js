import { Router } from 'express';
import {
  getUserStatistics,
  sendNotification,
  customizeHomeScreen,
  addWidget,
  getMe,
} from '../controllers/userController.js'; // Αφαιρέθηκε το createUser από τα imports
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// --- All routes below are protected ---
router.use(protect);

// @route   GET /api/v1/users/me
// @desc    Get current user
// @access  Private
// Το βάζω ψηλά για να μην μπερδευτεί με το /:userId
router.get('/me', getMe); 

// @route   GET /api/v1/users/:userId/statistics
// @desc    View statistics
// @access  Private
router.get('/:userId/statistics', getUserStatistics);

// @route   POST /api/v1/users/:userId/notifications
// @desc    Send notification to user
// @access  Private
router.post('/:userId/notifications', validate(), sendNotification);

// @route   PUT /api/v1/users/:userId/home
// @desc    Customize home screen
// @access  Private
router.put('/:userId/home', validate(), customizeHomeScreen);

// @route   POST /api/v1/users/:userId/widgets
// @desc    Add widgets
// @access  Private
router.post('/:userId/widgets', validate(), addWidget);

export default router;