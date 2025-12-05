import { ApiError } from '../utils/ApiError.js';
import Scenario from '../models/Scenario.js';
import { db } from '../config/database.js';
import { mockScenarios } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @function getScenarios
 * @async
 * @description Retrieves a list of all scenarios associated with a specific user.
 * This serves as the main "Read" operation for the Scenario dashboard.
 * It automatically switches between Mongoose (MongoDB) and in-memory Mock Data
 * depending on the database connection status.
 *
 * @param {string} userId - The unique identifier of the user (ObjectId string) who owns the scenarios.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of Scenario objects.
 * Returns an empty array if no scenarios are found.
 */
export const getScenarios = async (userId) => {
  if (db.isConnected) {
    // Database Path: Query the 'scenarios' collection using the Mongoose model
    return await Scenario.find({ userId });
  } else {
    // Mock Data Path: Filter the in-memory array for matching userId
    return mockScenarios.filter((s) => s.userId === userId);
  }
};

/**
 * @function getScenarioById
 * @async
 * @description Fetches the details of a single, specific scenario.
 * This function enforces data privacy by requiring both the `scenarioId`
 * AND the `userId`. This ensures a user cannot access a scenario belonging
 * to someone else, even if they guess the ID.
 *
 * @param {string} scenarioId - The unique identifier of the scenario to retrieve.
 * @param {string} userId - The unique identifier of the requesting user (for authorization).
 * @returns {Promise<Object>} A promise that resolves to the requested Scenario document.
 * @throws {ApiError} 404 - If the scenario does not exist or does not belong to the user.
 */
export const getScenarioById = async (scenarioId, userId) => {
  if (db.isConnected) {
    const scenario = await Scenario.findOne({ _id: scenarioId, userId });
    if (!scenario) {
      throw new ApiError(404, 'Scenario not found');
    }
    return scenario;
  } else {
    const scenario = mockScenarios.find((s) => s._id === scenarioId && s.userId === userId);
    if (!scenario) {
      throw new ApiError(404, 'Scenario not found');
    }
    return scenario;
  }
};

/**
 * @function createScenario
 * @async
 * @description Creates a new Scenario for the user.
 * A Scenario is defined as a "Complex Routine" involving multiple devices.
 * Therefore, this function enforces a strict Business Logic validation:
 * The scenario MUST contain at least 2 actions/devices.
 *
 * @param {string} userId - The ID of the user creating the scenario.
 * @param {object} scenarioData - The payload containing scenario details.
 * @param {string} scenarioData.name - The display name of the scenario.
 * @param {Array<Object>} scenarioData.actions - An array of action objects ({ deviceId, command }).
 *
 * @returns {Promise<Object>} The newly created Scenario object (including its generated _id).
 * @throws {ApiError} 400 - If the scenario contains fewer than 2 actions (Business Logic Violation).
 */
export const createScenario = async (userId, scenarioData) => {
  // --- BUSINESS LOGIC VALIDATION ---
  // Requirement S-3 / AD-8: A scenario implies a complex routine > 1 device.
  // We validate this before attempting to save to DB or Mock array.
  if (!scenarioData.actions || scenarioData.actions.length < 2) {
    throw new ApiError(400, 'A scenario must contain at least 2 devices/actions');
  }

  if (db.isConnected) {
    // Database Path: Mongoose handles creation and ID generation
    return await Scenario.create({ ...scenarioData, userId });
  } else {
    // Mock Data Path: Manually construct the object and generate a UUID
    const newScenario = {
      _id: `scene-${uuidv4()}`,
      ...scenarioData,
      userId,
      createdAt: new Date(),
    };
    mockScenarios.push(newScenario);
    return newScenario;
  }
};

/**
 * @function updateScenario
 * @async
 * @description Updates an existing scenario.
 * Supports partial updates (e.g., changing just the name or adding an action).
 * Ensures the operation is scoped to the `userId` for security.
 *
 * @param {string} scenarioId - The ID of the scenario to update.
 * @param {string} userId - The ID of the owner.
 * @param {object} updates - An object containing the fields to modify.
 * @returns {Promise<Object>} The updated Scenario object.
 * @throws {ApiError} 404 - If the scenario is not found or user is unauthorized.
 */
export const updateScenario = async (scenarioId, userId, updates) => {
  if (db.isConnected) {
    const scenario = await Scenario.findOneAndUpdate(
      { _id: scenarioId, userId },
      updates,
      { new: true, runValidators: true } // Return the modified document, not the original
    );
    if (!scenario) {
      throw new ApiError(404, 'Scenario not found');
    }
    return scenario;
  } else {
    const scenario = mockScenarios.find((s) => s._id === scenarioId && s.userId === userId);
    if (!scenario) {
      throw new ApiError(404, 'Scenario not found');
    }
    // Apply updates in-place to the mock object
    Object.assign(scenario, updates);
    return scenario;
  }
};

/**
 * @function deleteScenario
 * @async
 * @description Permanently removes a scenario from the system.
 *
 * @param {string} scenarioId - The ID of the scenario to delete.
 * @param {string} userId - The ID of the owner (security check).
 * @returns {Promise<Object>} A confirmation object containing the deleted ID and status.
 * @throws {ApiError} 404 - If the scenario is not found.
 */
export const deleteScenario = async (scenarioId, userId) => {
  if (db.isConnected) {
    const scenario = await Scenario.findOne({ _id: scenarioId, userId });
    if (!scenario) {
      throw new ApiError(404, 'Scenario not found');
    }
    await scenario.deleteOne();
  } else {
    const index = mockScenarios.findIndex((s) => s._id === scenarioId && s.userId === userId);
    if (index === -1) {
      throw new ApiError(404, 'Scenario not found');
    }
    // Remove the element from the mock array
    mockScenarios.splice(index, 1);
  }
  return { _id: scenarioId, status: 'removed' };
};