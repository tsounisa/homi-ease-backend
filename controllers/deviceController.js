import * as deviceService from '../services/deviceService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller getDevices
 * @description Get all devices for a specific room.
 * @route GET /api/v1/rooms/:roomId/devices
 * @access Private
 */
export const getDevices = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const devices = await deviceService.getDevicesInRoom(roomId);
    sendSuccessResponse(res, 200, 'Devices fetched successfully', devices);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getAvailableDevices
 * @description Get all available devices for the authenticated user that are not yet paired.
 * @route GET /api/v1/devices/available
 * @access Private
 */
export const getAvailableDevices = async (req, res, next) => {
  try {
    const userId = req.user._id; // From protect middleware
    const availableDevices = await deviceService.getAvailableDevicesForUser(userId);
    sendSuccessResponse(res, 200, 'Available devices fetched successfully', availableDevices);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller addDeviceToRoom
 * @description Add a smart device to a room.
 * @route POST /api/v1/rooms/:roomId/devices
 * @access Private
 */
export const addDeviceToRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id; // From protect middleware for ownership check in service
    const deviceData = { ...req.body, owner: userId }; // Pass owner for available device check
    const device = await deviceService.addDeviceToRoom(roomId, deviceData);
    sendSuccessResponse(res, 201, 'Device added', device);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller removeDevice
 * @description Remove a smart device.
 * @route DELETE /api/v1/devices/:deviceId
 * @access Private
 */
export const removeDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user._id; // From protect middleware for ownership check
    const result = await deviceService.removeDevice(deviceId, userId);
    sendSuccessResponse(res, 200, 'Device removed', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller categorizeDevice
 * @description Categorize a smart device.
 * @route PUT /api/v1/devices/:deviceId
 * @access Private
 */
export const categorizeDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { category } = req.body;
    const device = await deviceService.categorizeDevice(deviceId, category);
    sendSuccessResponse(res, 200, 'Device updated', device);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller getDeviceStatus
 * @description Communicate with (get status of) smart device.
 * @route GET /api/v1/devices/:deviceId/status
 * @access Private
 */
export const getDeviceStatus = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const status = await deviceService.getDeviceStatus(deviceId);
    sendSuccessResponse(res, 200, 'Status retrieved', status);
  } catch (error) {
    next(error);
  }
};

/**
 * @controller controlDevice
 * @description Control smart device manually.
 * @route POST /api/v1/devices/:deviceId/action
 * @access Private
 */
export const controlDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const action = req.body; // e.g., { "isOn": true, "brightness": 50 }
    const status = await deviceService.controlDevice(deviceId, action);
    sendSuccessResponse(res, 200, 'Action performed', status);
  } catch (error) {
    next(error);
  }
};