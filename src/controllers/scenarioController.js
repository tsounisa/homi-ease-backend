import * as scenarioService from '../services/scenarioService.js';
import { sendSuccessResponse } from '../utils/responses.js';

export const getScenarios = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const scenarios = await scenarioService.getScenarios(userId);
    sendSuccessResponse(res, 200, 'Scenarios fetched successfully', scenarios);
  } catch (error) {
    next(error);
  }
};

export const getScenario = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { scenarioId } = req.params;
    const scenario = await scenarioService.getScenarioById(scenarioId, userId);
    sendSuccessResponse(res, 200, 'Scenario fetched successfully', scenario);
  } catch (error) {
    next(error);
  }
};

export const createScenario = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const scenarioData = req.body;
    const newScenario = await scenarioService.createScenario(userId, scenarioData);
    sendSuccessResponse(res, 201, 'Scenario created successfully', newScenario);
  } catch (error) {
    next(error);
  }
};

export const updateScenario = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { scenarioId } = req.params;
    const updates = req.body;
    const updatedScenario = await scenarioService.updateScenario(scenarioId, userId, updates);
    sendSuccessResponse(res, 200, 'Scenario updated successfully', updatedScenario);
  } catch (error) {
    next(error);
  }
};

export const deleteScenario = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { scenarioId } = req.params;
    const result = await scenarioService.deleteScenario(scenarioId, userId);
    sendSuccessResponse(res, 200, 'Scenario deleted successfully', result);
  } catch (error) {
    next(error);
  }
};