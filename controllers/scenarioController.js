import * as scenarioService from '../services/scenarioService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller createScenario
 * @description Create a scenario.
 * @route POST /api/v1/scenarios
 * @access Private
 */
export const createScenario = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const scenarioData = req.body;
    const scenario = await scenarioService.createScenario(userId, scenarioData);
    sendSuccessResponse(res, 201, 'Scenario created', scenario);
  } catch (error) {
    next(error);
  }
};