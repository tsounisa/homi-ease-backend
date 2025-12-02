import { Router } from 'express';
import { controlSecuritySystem } from '../controllers/securityController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.use(protect);

// @route   PUT /api/v1/security/:deviceId/state
// @desc    Control the security system
// @access  Private
router.put('/:deviceId/state', validate(), controlSecuritySystem);

export default router;