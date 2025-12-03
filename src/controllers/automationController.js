import * as automationService from '../services/automationService.js';
import { sendSuccessResponse } from '../utils/responses.js';

export const getAutomations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const automations = await automationService.getAutomations(userId);
    sendSuccessResponse(res, 200, 'Automations fetched successfully', automations);
  } catch (error) {
    next(error);
  }
};

export const getAutomation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { automationId } = req.params;
    const automation = await automationService.getAutomationById(automationId, userId);
    sendSuccessResponse(res, 200, 'Automation fetched successfully', automation);
  } catch (error) {
    next(error);
  }
};

export const createAutomation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const automationData = req.body;
    const newAutomation = await automationService.createAutomation(userId, automationData);
    sendSuccessResponse(res, 201, 'Automation created successfully', newAutomation);
  } catch (error) {
    next(error);
  }
};

export const updateAutomation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { automationId } = req.params;
    const updates = req.body;
    const updatedAutomation = await automationService.updateAutomation(automationId, userId, updates);
    sendSuccessResponse(res, 200, 'Automation updated successfully', updatedAutomation);
  } catch (error) {
    next(error);
  }
};

export const deleteAutomation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { automationId } = req.params;
    const result = await automationService.deleteAutomation(automationId, userId);
    sendSuccessResponse(res, 200, 'Automation deleted successfully', result);
  } catch (error) {
    next(error);
  }
};