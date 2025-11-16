import { ApiError } from '../utils/ApiError.js';
import Room from '../models/Room.js';
import House from '../models/House.js';
import { db } from '../config/database.js';
import { mockRooms, mockHouses } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * @function getRoomsInHouse
 * @description Gets all rooms for a specific house.
 * @param {string} houseId - The ID of the house
 * @returns {Promise<Array<object>>} A list of rooms
 */
export const getRoomsInHouse = async (houseId) => {
  if (db.isConnected) {
    // MongoDB Logic
    return await Room.find({ house: houseId });
  } else {
    // Mock Data Logic
    return mockRooms.filter((r) => r.house === houseId);
  }
};

/**
 * @function addRoomToHouse
 * @description Adds a new room to a specific house.
 * @param {string} houseId - The ID of the house
 * @param {object} roomData - Data for the new room (e.g., name)
 * @returns {Promise<object>} The created room
 */
export const addRoomToHouse = async (houseId, roomData) => {
  if (db.isConnected) {
    // MongoDB Logic
    const room = await Room.create({ ...roomData, house: houseId });
    // Add room to house's document
    await House.findByIdAndUpdate(houseId, { $push: { rooms: room._id } });
    return room;
  } else {
    // Mock Data Logic
    const house = mockHouses.find((h) => h._id === houseId);
    if (!house) {
      throw new ApiError(404, 'House not found');
    }
    const room = {
      _id: `room-${uuidv4()}`,
      ...roomData,
      house: houseId,
      devices: [],
      settings: { temperature: 21, lighting: 100 },
      createdAt: new Date(),
    };
    mockRooms.push(room);
    house.rooms.push(room._id);
    return room;
  }
};

/**
 * @function removeRoom
 * @description Removes a room from a house.
 * @param {string} roomId - The ID of the room to remove
 * @returns {Promise<object>} A confirmation object
 */
export const removeRoom = async (roomId) => {
  let houseId;
  if (db.isConnected) {
    // MongoDB Logic
    const room = await Room.findById(roomId);
    if (!room) {
      throw new ApiError(404, 'Room not found');
    }
    houseId = room.house;
    // In a real app, you'd also delete all devices (Cascade)
    await room.deleteOne();
    // Remove from house's room list
    await House.findByIdAndUpdate(houseId, { $pull: { rooms: roomId } });
  } else {
    // Mock Data Logic
    const roomIndex = mockRooms.findIndex((r) => r._id === roomId);
    if (roomIndex === -1) {
      throw new ApiError(404, 'Room not found');
    }
    houseId = mockRooms[roomIndex].house;
    mockRooms.splice(roomIndex, 1);
    // Remove from mock house
    const house = mockHouses.find((h) => h._id === houseId);
    if (house) house.rooms = house.rooms.filter((id) => id !== roomId);
  }

  return { _id: roomId, status: 'removed' };
};

/**
 * @function setRoomTemperature
 * @description Sets the target temperature for a room.
 * @param {string} roomId - The ID of the room
 * @param {number} temperature - The target temperature
 * @returns {Promise<object>} The updated room settings
 */
export const setRoomTemperature = async (roomId, temperature) => {
  let room;
  if (db.isConnected) {
    room = await Room.findByIdAndUpdate(
      roomId,
      { 'settings.temperature': temperature },
      { new: true, runValidators: true }
    );
    if (!room) throw new ApiError(404, 'Room not found');
  } else {
    room = mockRooms.find((r) => r._id === roomId);
    if (!room) throw new ApiError(404, 'Room not found');
    room.settings.temperature = temperature;
  }
  // This would also trigger commands to thermostat devices
  logger.info(`Setting temperature for room ${roomId} to ${temperature}°C`);
  return room.settings;
};

/**
 * @function controlRoomLighting
 * @description Controls the lighting for a room.
 * @param {string} roomId - The ID of the room
 * @param {object} lightingData - e.g., { isOn: true, brightness: 80 }
 * @returns {Promise<object>} The updated room settings
 */
export const controlRoomLighting = async (roomId, lightingData) => {
  let room;
  if (db.isConnected) {
    room = await Room.findByIdAndUpdate(
      roomId,
      { 'settings.lighting': lightingData.brightness },
      { new: true, runValidators: true }
    );
    if (!room) throw new ApiError(404, 'Room not found');
  } else {
    room = mockRooms.find((r) => r._id === roomId);
    if (!room) throw new ApiError(404, 'Room not found');
    if (lightingData.brightness)
      room.settings.lighting = lightingData.brightness;
  }
  // This would also trigger commands to light devices
  logger.info(`Setting lighting for room ${roomId}: ${lightingData}`);
  return room.settings;
};