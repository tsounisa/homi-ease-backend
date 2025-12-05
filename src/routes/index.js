import { Router } from 'express';
import authRoutes from './authRoutes.js';
import houseRoutes from './houseRoutes.js';
import roomRoutes from './roomRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import automationRoutes from './automationRoutes.js';
import scenarioRoutes from './scenarioRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/houses', houseRoutes);
router.use('/rooms', roomRoutes);
router.use('/devices', deviceRoutes);
router.use('/automations', automationRoutes);
router.use('/scenarios', scenarioRoutes);

export default router;