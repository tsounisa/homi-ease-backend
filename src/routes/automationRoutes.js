import { Router } from 'express';
import { createAutomation } from '../controllers/automationController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.use(protect);

// @route   POST /api/v1/automations
// @desc    Automate smart devices (create rule)
// @access  Private
router.post('/', validate(), createAutomation);

export default router;