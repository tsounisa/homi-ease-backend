import { ApiError } from '../utils/ApiError.js';
import Device from '../models/Device.js';
import Room from '../models/Room.js';
import { db } from '../config/database.js';
import { mockDevices, mockRooms } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';

export const getDevicesByRoomId = async (roomId) => {
  if (db.isConnected) {
    return await Device.find({ room: roomId });
  } else {
    return mockDevices.filter((d) => d.roomId === roomId);
  }
};

export const getDeviceById = async (deviceId) => {
  if (db.isConnected) {
    const device = await Device.findById(deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
    return device;
  } else {
    const device = mockDevices.find((d) => d._id === deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
    return device;
  }
};

export const addDevice = async (roomId, deviceData) => {
  if (db.isConnected) {
    const device = await Device.create({ ...deviceData, room: roomId });
    await Room.findByIdAndUpdate(roomId, { $push: { devices: device._id } });
    return device;
  } else {
    const room = mockRooms.find((r) => r._id === roomId);
    if (!room) throw new ApiError(404, 'Room not found');

    const device = {
      _id: `device-${uuidv4()}`,
      name: deviceData.name,
      type: deviceData.type || 'other', //Default fallback
      roomId: roomId,
      status: deviceData.status || { isOn: false },
      createdAt: new Date(),
    };
    
    mockDevices.push(device);
    if (room.devices) room.devices.push(device._id);
    return device;
  }
};

export const updateDevice = async (deviceId, updates) => {
  if (db.isConnected) {
    const device = await Device.findByIdAndUpdate(deviceId, updates, { new: true });
    if (!device) throw new ApiError(404, 'Device not found');
    return device;
  } else {
    const device = mockDevices.find((d) => d._id === deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
    Object.assign(device, updates);
    return device;
  }
};

export const removeDevice = async (deviceId) => {
  let roomId;
  if (db.isConnected) {
    const device = await Device.findById(deviceId);
    if (!device) throw new ApiError(404, 'Device not found');
    roomId = device.room;
    await device.deleteOne();
    await Room.findByIdAndUpdate(roomId, { $pull: { devices: deviceId } });
  } else {
    const index = mockDevices.findIndex((d) => d._id === deviceId);
    if (index === -1) throw new ApiError(404, 'Device not found');
    
    roomId = mockDevices[index].roomId;
    mockDevices.splice(index, 1);

    const room = mockRooms.find((r) => r._id === roomId);
    if (room && room.devices) {
      room.devices = room.devices.filter((id) => id !== deviceId);
    }
  }
  return { _id: deviceId, status: 'removed' };
};