import { ApiError } from '../utils/ApiError.js';
import Room from '../models/Room.js';
import House from '../models/House.js';
import { db } from '../config/database.js';
import { mockRooms, mockHouses } from '../config/mockData.js';
import { v4 as uuidv4 } from 'uuid';

export const getRoomsInHouse = async (houseId) => {
  if (db.isConnected) {
    return await Room.find({ house: houseId });
  } else {
    return mockRooms.filter((r) => r.houseId === houseId);
  }
};

// NEW: Get Single Room
export const getRoomById = async (roomId) => {
  if (db.isConnected) {
    const room = await Room.findById(roomId);
    if (!room) throw new ApiError(404, 'Room not found');
    return room;
  } else {
    const room = mockRooms.find((r) => r._id === roomId);
    if (!room) throw new ApiError(404, 'Room not found');
    return room;
  }
};

export const addRoomToHouse = async (houseId, roomData) => {
  if (db.isConnected) {
    const room = await Room.create({ ...roomData, house: houseId });
    await House.findByIdAndUpdate(houseId, { $push: { rooms: room._id } });
    return room;
  } else {
    const house = mockHouses.find((h) => h._id === houseId);
    if (!house) throw new ApiError(404, 'House not found');
    
    const room = {
      _id: `room-${uuidv4()}`,
      ...roomData,
      houseId: houseId,
      devices: [],
      settings: { temperature: 21, lighting: 100 },
      createdAt: new Date(),
    };
    mockRooms.push(room);
    if (house.rooms) house.rooms.push(room._id);
    
    return room;
  }
};

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
    
    houseId = mockRooms[roomIndex].houseId; 
    mockRooms.splice(roomIndex, 1);
    
    const house = mockHouses.find((h) => h._id === houseId);
    if (house && house.rooms) {
      house.rooms = house.rooms.filter((id) => id !== roomId);
    }
  }
  return { _id: roomId, status: 'removed' };
};