import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { createUser } from '../controllers/userController.js';
import { validate } from '../middleware/validation.js'; // Placeholder

const router = Router();

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(), createUser); 

// @route   POST /api/v1/auth/login
// @desc    Login to account
// @access  Public
router.post('/login', validate(), login);

export default router;