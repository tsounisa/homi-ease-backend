import * as deviceService from '../services/deviceService.js';
import { sendSuccessResponse } from '../utils/responses.js';

export const getDevices = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const devices = await deviceService.getDevicesByRoomId(roomId);
    sendSuccessResponse(res, 200, 'Devices fetched successfully', devices);
  } catch (error) {
    next(error);
  }
};

export const addDeviceToRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const deviceData = req.body;
    const device = await deviceService.addDevice(roomId, deviceData);
    sendSuccessResponse(res, 201, 'Device added successfully', device);
  } catch (error) {
    next(error);
  }
};

export const getDeviceStatus = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const status = await deviceService.getDeviceStatus(deviceId);
    sendSuccessResponse(res, 200, 'Status retrieved', status);
  } catch (error) {
    next(error);
  }
};

export const updateDeviceDetails = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const updates = req.body;
    const device = await deviceService.updateDevice(deviceId, updates);
    sendSuccessResponse(res, 200, 'Device updated successfully', device);
  } catch (error) {
    next(error);
  }
};

export const removeDevice = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const result = await deviceService.removeDevice(deviceId);
    sendSuccessResponse(res, 200, 'Device removed successfully', result);
  } catch (error) {
    next(error);
  }
};