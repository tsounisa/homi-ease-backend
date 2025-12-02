import * as automationService from '../services/automationService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller createAutomation
 * @description Automate smart devices (create a rule).
 * @route POST /api/v1/automations
 * @access Private
 */
export const createAutomation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const automationData = req.body;
    const rule = await automationService.createAutomation(
      userId,
      automationData
    );
    sendSuccessResponse(res, 201, 'Automation rule created', rule);
  } catch (error) {
    next(error);
  }
};