import { ApiError } from '../utils/ApiError.js';
import Automation from '../models/Automation.js';
import { db } from '../config/database.js';
import { mockAutomations } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @function getAutomations
 * @async
 * @description Retrieves a list of all automation rules associated with a specific user.
 * This function serves as the main "Read" operation for the Automations dashboard.
 * It automatically checks the database connection status to determine the data source.
 *
 * @param {string} userId - The unique identifier of the user (ObjectId string).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of Automation objects.
 * Returns an empty array if no automations are found.
 */
export const getAutomations = async (userId) => {
  if (db.isConnected) {
    // Database Path: Query the 'automations' collection using the Mongoose model
    return await Automation.find({ userId });
  } else {
    // Mock Data Path: Filter the in-memory array for matching userId
    return mockAutomations.filter((a) => a.userId === userId);
  }
};

/**
 * @function getAutomationById
 * @async
 * @description Fetches the details of a single, specific automation rule.
 * This function enforces data privacy by requiring both the `automationId`
 * AND the `userId`. This ensures a user cannot access an automation belonging
 * to someone else, even if they guess the ID.
 *
 * @param {string} automationId - The unique identifier of the automation to retrieve.
 * @param {string} userId - The unique identifier of the requesting user (for authorization).
 * @returns {Promise<Object>} A promise that resolves to the requested Automation document.
 * @throws {ApiError} 404 - If the automation does not exist or does not belong to the user.
 */
export const getAutomationById = async (automationId, userId) => {
  if (db.isConnected) {
    const automation = await Automation.findOne({ _id: automationId, userId });
    if (!automation) {
      throw new ApiError(404, 'Automation not found');
    }
    return automation;
  } else {
    const automation = mockAutomations.find((a) => a._id === automationId && a.userId === userId);
    if (!automation) {
      throw new ApiError(404, 'Automation not found');
    }
    return automation;
  }
};

/**
 * @function createAutomation
 * @async
 * @description Creates a new Automation rule for the user.
 * An automation consists of a Trigger (e.g., Time or Sensor) and an Action
 * (e.g., Turn on Device). The `isEnabled` flag is set to true by default.
 *
 * @param {string} userId - The ID of the user creating the automation.
 * @param {object} automationData - The payload containing automation details.
 * @param {string} automationData.name - The display name of the automation.
 * @param {object} automationData.trigger - The trigger condition ({ type, value }).
 * @param {object} automationData.action - The action to perform ({ deviceId, command }).
 *
 * @returns {Promise<Object>} The newly created Automation object (including its generated _id).
 */
export const createAutomation = async (userId, automationData) => {
  if (db.isConnected) {
    // Database Path: Mongoose handles creation and ID generation
    return await Automation.create({ ...automationData, userId });
  } else {
    // Mock Data Path: Manually construct the object and generate a UUID
    const newAutomation = {
      _id: `auto-${uuidv4()}`,
      ...automationData,
      userId,
      isEnabled: true, // Default behavior defined in Schema
      createdAt: new Date(),
    };
    mockAutomations.push(newAutomation);
    return newAutomation;
  }
};

/**
 * @function updateAutomation
 * @async
 * @description Updates an existing automation rule.
 * Supports partial updates (e.g., changing just the name, or disabling the rule).
 * Ensures the operation is scoped to the `userId` for security.
 *
 * @param {string} automationId - The ID of the automation to update.
 * @param {string} userId - The ID of the owner.
 * @param {object} updates - An object containing the fields to modify.
 * @returns {Promise<Object>} The updated Automation object.
 * @throws {ApiError} 404 - If the automation is not found or user is unauthorized.
 */
export const updateAutomation = async (automationId, userId, updates) => {
  if (db.isConnected) {
    const automation = await Automation.findOneAndUpdate(
      { _id: automationId, userId },
      updates,
      { new: true, runValidators: true } // Return the modified document, not the original
    );
    if (!automation) {
      throw new ApiError(404, 'Automation not found');
    }
    return automation;
  } else {
    const automation = mockAutomations.find((a) => a._id === automationId && a.userId === userId);
    if (!automation) {
      throw new ApiError(404, 'Automation not found');
    }
    // Apply updates in-place to the mock object
    Object.assign(automation, updates);
    return automation;
  }
};

/**
 * @function deleteAutomation
 * @async
 * @description Permanently removes an automation rule from the system.
 *
 * @param {string} automationId - The ID of the automation to delete.
 * @param {string} userId - The ID of the owner (security check).
 * @returns {Promise<Object>} A confirmation object containing the deleted ID and status.
 * @throws {ApiError} 404 - If the automation is not found.
 */
export const deleteAutomation = async (automationId, userId) => {
  if (db.isConnected) {
    const automation = await Automation.findOne({ _id: automationId, userId });
    if (!automation) {
      throw new ApiError(404, 'Automation not found');
    }
    await automation.deleteOne();
  } else {
    const index = mockAutomations.findIndex((a) => a._id === automationId && a.userId === userId);
    if (index === -1) {
      throw new ApiError(404, 'Automation not found');
    }
    // Remove the element from the mock array
    mockAutomations.splice(index, 1);
  }
  return { _id: automationId, status: 'removed' };
};