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
    return await House.find({ owner: userId });
  } else {
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
    house = await House.findOne({ _id: houseId, owner: userId }).populate('rooms');
  } else {
    house = mockHouses.find((h) => h._id === houseId && h.owner === userId);
    if (house) {
      // Αν θέλουμε να επιστρέψουμε και τα δωμάτια μέσα στο αντικείμενο του σπιτιού (mock populate)
      house = { ...house }; // Clone to avoid mutating original mock data structure permanently with circular refs if careful
      house.rooms = (house.rooms || []).map(roomId => mockRooms.find(r => r._id === roomId)).filter(Boolean);
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
    const house = await House.create({ ...houseData, owner: userId });
    await User.findByIdAndUpdate(userId, { $push: { houses: house._id } });
    return house;
  } else {
    const house = {
      _id: `house-${uuidv4()}`,
      ...houseData,
      owner: userId,
      rooms: [],
      createdAt: new Date(),
    };
    mockHouses.push(house);
    const user = mockUsers.find((u) => u._id === userId);
    if (user) user.houses.push(house._id);
    return house;
  }
};

/**
 * @function updateHouse
 * @description Updates an existing house.
 * @param {string} houseId - The ID of the house
 * @param {string} userId - The owner's ID
 * @param {object} updates - The fields to update (e.g. { name: "New Name" })
 * @returns {Promise<object>} The updated house
 */
export const updateHouse = async (houseId, userId, updates) => {
  if (db.isConnected) {
    const house = await House.findOneAndUpdate(
      { _id: houseId, owner: userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!house) {
      throw new ApiError(404, 'House not found or you are not the owner');
    }
    return house;
  } else {
    // Mock Data Logic
    const house = mockHouses.find((h) => h._id === houseId && h.owner === userId);
    if (!house) {
      throw new ApiError(404, 'House not found or you are not the owner');
    }
    // Ενημέρωση πεδίων
    Object.assign(house, updates);
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
    const house = await House.findOne({ _id: houseId, owner: userId });
    if (!house) {
      throw new ApiError(404, 'House not found or you are not the owner');
    }
    await house.deleteOne();
    await User.findByIdAndUpdate(userId, { $pull: { houses: houseId } });
  } else {
    const houseIndex = mockHouses.findIndex(
      (h) => h._id === houseId && h.owner === userId
    );
    if (houseIndex === -1) {
      throw new ApiError(404, 'House not found or you are not the owner');
    }
    mockHouses.splice(houseIndex, 1);
    const user = mockUsers.find((u) => u._id === userId);
    if (user) user.houses = user.houses.filter((id) => id !== houseId);
  }

  return { _id: houseId, status: 'removed' };
};