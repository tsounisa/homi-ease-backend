import { Router } from 'express';
// 1. Import the new getMe controller
import { login, register, getMe } from '../controllers/authController.js'; 
import { validate } from '../middleware/validation.js';
// 2. Import your authentication middleware (Verify the file name!)
import { protect } from '../middleware/auth.js'; 

const router = Router();

// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', validate(), register); 

// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', validate(), login);

// @route   GET /api/v1/auth/me
// @desc    Get current user profile
// @access  Private (Protected)
// 3. Add this line:
router.get('/me', protect, getMe); 

export default router;