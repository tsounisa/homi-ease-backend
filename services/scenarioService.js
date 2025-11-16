import { ApiError } from '../utils/ApiError.js';
import Scenario from '../models/Scenario.js';
import { db } from '../config/database.js';
import { mockScenarios } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @function createScenario
 * @description Creates a new scenario (multi-device automation).
 * @param {string} userId - The owner's user ID
 * @param {object} scenarioData - Data for the new scenario
 * @returns {Promise<object>} The created scenario
 */
export const createScenario = async (userId, scenarioData) => {
  if (!scenarioData.actions || scenarioData.actions.length < 2) {
    throw new ApiError(
      400,
      'A scenario requires at least two device actions.'
    );
  }

  if (db.isConnected) {
    // MongoDB Logic
    const scenario = await Scenario.create({ ...scenarioData, owner: userId });
    return scenario;
  } else {
    // Mock Data Logic
    const scenario = {
      _id: `scene-${uuidv4()}`,
      ...scenarioData,
      owner: userId,
      createdAt: new Date(),
    };
    mockScenarios.push(scenario);
    return scenario;
  }
};