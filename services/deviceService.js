import { ApiError } from '../utils/ApiError.js';
import Device from '../models/Device.js';
import Room from '../models/Room.js';
import { db } from '../config/database.js';
import { mockDevices, mockRooms, mockAvailableDevices, mockHouses } from '../config/mockData.js'; // Import mockAvailableDevices
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * @function getDevicesInRoom
 * @description Gets all devices for a specific room.
 * @param {string} roomId - The ID of the room
 * @returns {Promise<Array<object>>} A list of devices
 */
export const getDevicesInRoom = async (roomId) => {
  if (db.isConnected) {
    // MongoDB Logic
    return await Device.find({ room: roomId });
  } else {
    // Mock Data Logic
    return mockDevices.filter((d) => d.room === roomId);
  }
};

/**
 * @function getAvailableDevicesForUser
 * @description Gets all available devices for a specific user that are not yet paired.
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array<object>>} A list of available devices
 */
export const getAvailableDevicesForUser = async (userId) => {
  if (db.isConnected) {
    // MongoDB Logic: In a real scenario, this would query a separate collection
    // for discoverable devices, possibly filtered by user's network or preferences.
    // For now, return empty array if not using mock data.
    return [];
  } else {
    // Mock Data Logic
    // Filter available devices by owner and ensure they are not already in mockDevices
    const pairedDeviceIds = new Set(mockDevices.map(d => d.originalAvailableDeviceId).filter(Boolean));
    return mockAvailableDevices.filter(
      (d) => d.owner === userId && !pairedDeviceIds.has(d._id)
    );
  }
};

/**
 * @function addDeviceToRoom
 * @description Adds a new smart device to a room, either from available devices or as a new custom device.
 * @param {string} roomId - The ID of the room
 * @param {object} deviceData - Data for the new device (can include availableDeviceId)
 * @returns {Promise<object>} The created device
 */
export const addDeviceToRoom = async (roomId, deviceData) => {
  if (db.isConnected) {
    // MongoDB Logic
    const device = await Device.create({ ...deviceData, room: roomId });
    await Room.findByIdAndUpdate(roomId, { $push: { devices: device._id } });
    return device;
  } else {
    // Mock Data Logic
    const room = mockRooms.find((r) => r._id === roomId);
    if (!room) throw new ApiError(404, 'Room not found');

    let newDevice;
    if (deviceData.availableDeviceId) {
      // Pairing an available device
      const availableDeviceIndex = mockAvailableDevices.findIndex(
        (d) => d._id === deviceData.availableDeviceId && d.owner === deviceData.owner // Ensure owner matches
      );

      if (availableDeviceIndex === -1) {
        throw new ApiError(404, 'Available device not found or not owned by user');
      }

      const availableDevice = mockAvailableDevices[availableDeviceIndex];
      // Create a new device entry from the available device
      newDevice = {
        _id: `device-${uuidv4()}`, // Assign a new unique ID for the paired device
        originalAvailableDeviceId: availableDevice._id, // Keep track of its origin
        name: availableDevice.name,
        type: availableDevice.type,
        category: availableDevice.category,
        room: roomId,
        status: availableDevice.status || { isOn: false }, // Use available device's status or default
        createdAt: new Date(),
      };
      // Do NOT remove from mockAvailableDevices, just mark as paired
      // In a real system, available devices might be a separate concept
      // or marked as 'paired' in their own collection.
      // For mock data, we'll filter them out in getAvailableDevicesForUser
      // based on originalAvailableDeviceId in mockDevices.
    } else {
      // Adding a custom/new device
      newDevice = {
        _id: `device-${uuidv4()}`,
        ...deviceData,
        room: roomId,
        status: deviceData.status || { isOn: false },
        createdAt: new Date(),
      };
    }

    mockDevices.push(newDevice);
    room.devices.push(newDevice._id);
    return newDevice;
  }
};

/**
 * @function removeDevice
 * @description Removes a smart device.
 * @param {string} deviceId - The ID of the device to remove
 * @param {string} userId - The ID of the user performing the action (for ownership check)
 * @returns {Promise<object>} A confirmation object
 */
export const removeDevice = async (deviceId, userId) => {
  let roomId;
  if (db.isConnected) {
    // MongoDB Logic
    const device = await Device.findById(deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
    // TODO: Add ownership check for MongoDB
    roomId = device.room;
    await device.deleteOne();
    await Room.findByIdAndUpdate(roomId, { $pull: { devices: deviceId } });
  } else {
    // Mock Data Logic
    const deviceIndex = mockDevices.findIndex((d) => d._id === deviceId);
    if (deviceIndex === -1) throw new ApiError(404, 'Device not found');

    // Basic ownership check for mock data: ensure the room belongs to a house owned by the user
    const room = mockRooms.find(r => r._id === mockDevices[deviceIndex].room);
    const house = room ? mockHouses.find(h => h._id === room.house) : null;
    if (!house || house.owner !== userId) {
      throw new ApiError(403, 'Not authorized to remove this device');
    }

    roomId = mockDevices[deviceIndex].room;
    mockDevices.splice(deviceIndex, 1);
    const roomToUpdate = mockRooms.find((r) => r._id === roomId);
    if (roomToUpdate) roomToUpdate.devices = roomToUpdate.devices.filter((id) => id !== deviceId);
  }
  return { _id: deviceId, status: 'removed' };
};

/**
 * @function categorizeDevice
 * @description Updates the category of a smart device.
 * @param {string} deviceId - The ID of the device
 * @param {string} category - The new category
 * @returns {Promise<object>} The updated device
 */
export const categorizeDevice = async (deviceId, category) => {
  let device;
  if (db.isConnected) {
    device = await Device.findByIdAndUpdate(
      deviceId,
      { category: category },
      { new: true, runValidators: true }
    );
    if (!device) throw new ApiError(404, 'Device not found');
  } else {
    device = mockDevices.find((d) => d._id === deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
    device.category = category;
  }
  return device;
};

/**
 * @function getDeviceStatus
 * @description Retrieves the current status of a smart device.
 * @param {string} deviceId - The ID of the device
 * @returns {Promise<object>} The device's status
 */
export const getDeviceStatus = async (deviceId) => {
  let device;
  if (db.isConnected) {
    device = await Device.findById(deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
  } else {
    device = mockDevices.find((d) => d._id === deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
  }
  // Simulate fetching live status
  logger.info(`Communicating with device ${deviceId} to get status...`);
  return device.status;
};

/**
 * @function controlDevice
 * @description Sends a control action to a smart device.
 * @param {string} deviceId - The ID of the device
 * @param {object} action - The action to perform (e.g., { "isOn": true })
 * @returns {Promise<object>} The new status of the device
 */
export const controlDevice = async (deviceId, action) => {
  let device;
  if (db.isConnected) {
    const deviceToUpdate = await Device.findById(deviceId);
    if (!deviceToUpdate) throw new ApiError(404, 'Device not found');
    // Merge new status
    const newStatus = { ...deviceToUpdate.status, ...action };
    device = await Device.findByIdAndUpdate(
      deviceId,
      { status: newStatus },
      { new: true }
    );
  } else {
    device = mockDevices.find((d) => d._id === deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
    // Merge new status
    device.status = { ...device.status, ...action };
  }
  logger.info(`Action performed on device ${deviceId}:`, action);
  return device.status;
};