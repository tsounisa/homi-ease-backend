import * as securityService from '../services/securityService.js';
import { sendSuccessResponse } from '../utils/responses.js';

/**
 * @controller controlSecuritySystem
 * @description Control the security system (a specific device).
 * @route PUT /api/v1/security/:deviceId/state
 * @access Private
 */
export const controlSecuritySystem = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const state = req.body; // e.g., { isArmed: true }
    const status = await securityService.setSecurityDeviceState(deviceId, state);
    sendSuccessResponse(res, 200, 'Security system updated', status);
  } catch (error) {
    next(error);
  }
};