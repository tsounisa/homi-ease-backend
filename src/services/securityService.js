import { ApiError } from '../utils/ApiError.js';
import Device from '../models/Device.js';
import { db } from '../config/database.js';
import { mockDevices } from '../config/mockData.js';
import { logger } from '../utils/logger.js';

/**
 * @function setSecurityDeviceState
 * @description Controls a security device (e.g., arm, disarm, lock).
 * @param {string} deviceId - The ID of the security device
 * @param {object} state - The new state (e.g., { isArmed: true, isLocked: true })
 * @returns {Promise<object>} The new status of the device
 */
export const setSecurityDeviceState = async (deviceId, state) => {
  let device;
  if (db.isConnected) {
    device = await Device.findById(deviceId);
    if (!device || device.type !== 'security') {
      throw new ApiError(404, 'Security device not found');
    }
    const newStatus = { ...device.status, ...state };
    device = await Device.findByIdAndUpdate(
      deviceId,
      { status: newStatus },
      { new: true }
    );
  } else {
    device = mockDevices.find(
      (d) => d._id === deviceId && d.type === 'security'
    );
    if (!device) {
      throw new ApiError(404, 'Security device not found');
    }
    device.status = { ...device.status, ...state };
  }
  logger.info(`Security system state updated for ${deviceId}:`, state);
  return device.status;
};