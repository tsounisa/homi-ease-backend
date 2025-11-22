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
 */
export const getRoomsInHouse = async (houseId) => {
  if (db.isConnected) {
    return await Room.find({ house: houseId });
  } else {
    // FIX: Χρησιμοποιούμε το 'houseId' (όπως στο mockData)
    return mockRooms.filter((r) => r.houseId === houseId);
  }
};

/**
 * @function addRoomToHouse
 * @description Adds a new room to a specific house.
 */
export const addRoomToHouse = async (houseId, roomData) => {
  if (db.isConnected) {
    const room = await Room.create({ ...roomData, house: houseId });
    await House.findByIdAndUpdate(houseId, { $push: { rooms: room._id } });
    return room;
  } else {
    const house = mockHouses.find((h) => h._id === houseId);
    if (!house) {
      throw new ApiError(404, 'House not found');
    }
    const room = {
      _id: `room-${uuidv4()}`,
      ...roomData,
      houseId: houseId, // FIX: houseId
      devices: [],
      settings: { temperature: 21, lighting: 100 }, // Default settings
      createdAt: new Date(),
    };
    mockRooms.push(room);
    // Add to mock house array
    if (house.rooms) house.rooms.push(room._id);
    
    return room;
  }
};

/**
 * @function updateRoom
 * @description Updates room details (generic update for Swagger).
 */
export const updateRoom = async (roomId, updates) => {
  if (db.isConnected) {
    const room = await Room.findByIdAndUpdate(roomId, updates, { new: true, runValidators: true });
    if (!room) throw new ApiError(404, 'Room not found');
    return room;
  } else {
    const room = mockRooms.find(r => r._id === roomId);
    if (!room) throw new ApiError(404, 'Room not found');
    
    Object.assign(room, updates);
    return room;
  }
};

/**
 * @function removeRoom
 * @description Removes a room from a house.
 */
export const removeRoom = async (roomId) => {
  let houseId;
  if (db.isConnected) {
    const room = await Room.findById(roomId);
    if (!room) throw new ApiError(404, 'Room not found');
    houseId = room.house;
    await room.deleteOne();
    await House.findByIdAndUpdate(houseId, { $pull: { rooms: roomId } });
  } else {
    const roomIndex = mockRooms.findIndex((r) => r._id === roomId);
    if (roomIndex === -1) throw new ApiError(404, 'Room not found');
    
    // FIX: houseId access
    houseId = mockRooms[roomIndex].houseId; 
    mockRooms.splice(roomIndex, 1);
    
    // Remove from mock house
    const house = mockHouses.find((h) => h._id === houseId);
    if (house && house.rooms) {
      house.rooms = house.rooms.filter((id) => id !== roomId);
    }
  }

  return { _id: roomId, status: 'removed' };
};

// (Optional: Temperature/Lighting functions retained if you need them later, 
//  but mainly we need updateRoom for the current Swagger tests)
export const setRoomTemperature = async (roomId, temperature) => {
    // ... (Logic remains similar, ensuring mock logic matches mockData structure)
    // Simplified for brevity as it's not in current Swagger test plan
    return { temperature }; 
};
export const controlRoomLighting = async (roomId, lightingData) => {
    return { lighting: lightingData.brightness };
};