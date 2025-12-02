import { ApiError } from '../utils/ApiError.js';
import Automation from '../models/Automation.js';
import { db } from '../config/database.js';
import { mockAutomations } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @function createAutomation
 * @description Creates a new automation rule for a user.
 * @param {string} userId - The owner's user ID
 * @param {object} automationData - Data for the new rule
 * @returns {Promise<object>} The created automation rule
 */
export const createAutomation = async (userId, automationData) => {
  if (!automationData.action || !automationData.trigger) {
    throw new ApiError(400, 'Please complete all fields');
  }

  if (db.isConnected) {
    // MongoDB Logic
    const automation = await Automation.create({
      ...automationData,
      owner: userId,
    });
    return automation;
  } else {
    // Mock Data Logic
    const automation = {
      _id: `auto-${uuidv4()}`,
      ...automationData,
      owner: userId,
      createdAt: new Date(),
    };
    mockAutomations.push(automation);
    return automation;
  }
};