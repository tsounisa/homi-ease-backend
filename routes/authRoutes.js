import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js'; // Placeholder

const router = Router();

// @route   POST /api/v1/auth/login
// @desc    Login to account
// @access  Public
router.post('/login', validate(), login); // Add validation schema later

export default router;