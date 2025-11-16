import { ApiError } from '../utils/ApiError.js';
import House from '../models/House.js';
import User from '../models/User.js';
import { db } from '../config/database.js';
import { mockHouses, mockUsers, mockRooms } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @function getHousesForUser
 * @description Gets all houses for a specific user.
 * @param {string} userId - The user's ID
 * @returns {Promise<Array<object>>} A list of houses
 */
export const getHousesForUser = async (userId) => {
  if (db.isConnected) {
    // MongoDB Logic
    return await House.find({ owner: userId });
  } else {
    // Mock Data Logic
    return mockHouses.filter((h) => h.owner === userId);
  }
};

/**
 * @function getHouseById
 * @description Gets a single house by its ID, ensuring user ownership.
 * @param {string} houseId - The ID of the house
 * @param {string} userId - The ID of the user
 * @returns {Promise<object>} The house object with populated rooms
 */
export const getHouseById = async (houseId, userId) => {
  let house;
  if (db.isConnected) {
    // MongoDB Logic
    house = await House.findOne({ _id: houseId, owner: userId }).populate('rooms');
  } else {
    // Mock Data Logic
    house = mockHouses.find((h) => h._id === houseId && h.owner === userId);
    if (house) {
      house.rooms = house.rooms.map(roomId => mockRooms.find(r => r._id === roomId)).filter(Boolean);
    }
  }

  if (!house) {
    throw new ApiError(404, 'House not found or you do not have access');
  }
  return house;
};

/**
 * @function addHouse
 * @description Adds a new house for a user.
 * @param {string} userId - The owner's user ID
 * @param {object} houseData - Data for the new house (e.g., name)
 * @returns {Promise<object>} The created house
 */
export const addHouse = async (userId, houseData) => {
  if (db.isConnected) {
    // MongoDB Logic
    const house = await House.create({ ...houseData, owner: userId });
    // Add house to user's document
    await User.findByIdAndUpdate(userId, { $push: { houses: house._id } });
    return house;
  } else {
    // Mock Data Logic
    const house = {
      _id: `house-${uuidv4()}`,
      ...houseData,
      owner: userId,
      rooms: [],
      createdAt: new Date(),
    };
    mockHouses.push(house);
    // Add to mock user
    const user = mockUsers.find((u) => u._id === userId);
    if (user) user.houses.push(house._id);
    return house;
  }
};

/**
 * @function removeHouse
 * @description Removes a house.
 * @param {string} houseId - The ID of the house to remove
 * @param {string} userId - The ID of the user performing the action
 * @returns {Promise<object>} A confirmation object
 */
export const removeHouse = async (houseId, userId) => {
  if (db.isConnected) {
    // MongoDB Logic
    const house = await House.findOne({ _id: houseId, owner: userId });
    if (!house) {
      throw new ApiError(404, 'House not found or you are not the owner');
    }
    // In a real app, you'd also delete all rooms and devices (Cascade)
    await house.deleteOne();
    await User.findByIdAndUpdate(userId, { $pull: { houses: houseId } });
  } else {
    // Mock Data Logic
    const houseIndex = mockHouses.findIndex(
      (h) => h._id === houseId && h.owner === userId
    );
    if (houseIndex === -1) {
      throw new ApiError(404, 'House not found or you are not the owner');
    }
    mockHouses.splice(houseIndex, 1);
    // Remove from mock user
    const user = mockUsers.find((u) => u._id === userId);
    if (user) user.houses = user.houses.filter((id) => id !== houseId);
  }

  return { _id: houseId, status: 'removed' };
};