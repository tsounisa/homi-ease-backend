import { Router } from 'express';
import { createScenario } from '../controllers/scenarioController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

router.use(protect);

// @route   POST /api/v1/scenarios
// @desc    Create a scenario
// @access  Private
router.post('/', validate(), createScenario);

export default router;