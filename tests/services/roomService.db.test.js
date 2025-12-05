import { jest } from '@jest/globals';

// 1. Define Mocks
const mockRoomModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockHouseModel = {
  findByIdAndUpdate: jest.fn(),
};

const mockDbConfig = { db: { isConnected: true } };

// 2. Register Mocks
jest.unstable_mockModule('../../src/models/Room.js', () => ({ default: mockRoomModel }));
jest.unstable_mockModule('../../src/models/House.js', () => ({ default: mockHouseModel }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

// 3. Import Service
const roomService = await import('../../src/services/roomService.js');

describe('RoomService [DB Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRoomsInHouse: should query Mongoose', async () => {
    const expectedRooms = [{ _id: 'r1', name: 'Kitchen' }];
    mockRoomModel.find.mockResolvedValue(expectedRooms);
    
    const res = await roomService.getRoomsInHouse('h1');
    
    // Check it uses the new 'houseId' field we refactored
    expect(mockRoomModel.find).toHaveBeenCalledWith({ houseId: 'h1' });
    expect(res).toEqual(expectedRooms);
  });

  it('getRoomById: should return room', async () => {
    const mockRoom = { _id: 'r1', name: 'Kitchen' };
    mockRoomModel.findById.mockResolvedValue(mockRoom);
    
    const res = await roomService.getRoomById('r1');
    expect(res).toBe(mockRoom);
  });

  it('getRoomById: should throw if not found', async () => {
    mockRoomModel.findById.mockResolvedValue(null);
    await expect(roomService.getRoomById('r1')).rejects.toThrow();
  });

  it('addRoomToHouse: should create via Mongoose', async () => {
    const roomData = { name: 'Bedroom' };
    const createdRoom = { _id: 'r1', ...roomData, houseId: 'h1' };
    
    mockRoomModel.create.mockResolvedValue(createdRoom);
    mockHouseModel.findByIdAndUpdate.mockResolvedValue(true);

    const res = await roomService.addRoomToHouse('h1', roomData);

    // Verify it assigns 'houseId' correctly
    expect(mockRoomModel.create).toHaveBeenCalledWith({ ...roomData, houseId: 'h1' });
    // Verify it updates parent House
    expect(mockHouseModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'h1', 
      { $push: { rooms: 'r1' } }
    );
    expect(res).toEqual(createdRoom);
  });

  it('updateRoom: should update via Mongoose', async () => {
    const updates = { name: 'Updated Room' };
    mockRoomModel.findByIdAndUpdate.mockResolvedValue({ _id: 'r1', ...updates });

    const res = await roomService.updateRoom('r1', updates);
    expect(mockRoomModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.name).toBe('Updated Room');
  });

  it('updateRoom: should throw if not found', async () => {
    mockRoomModel.findByIdAndUpdate.mockResolvedValue(null);
    await expect(roomService.updateRoom('r1', {})).rejects.toThrow();
  });

  it('removeRoom: should delete via Mongoose', async () => {
    const mockRoom = { _id: 'r1', houseId: 'h1', deleteOne: jest.fn() };
    
    // Logic requires finding the room first to get the houseId
    mockRoomModel.findById.mockResolvedValue(mockRoom);
    mockHouseModel.findByIdAndUpdate.mockResolvedValue(true);

    await roomService.removeRoom('r1');

    expect(mockRoom.deleteOne).toHaveBeenCalled();
    expect(mockHouseModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'h1', 
      { $pull: { rooms: 'r1' } }
    );
  });

  it('removeRoom: should throw if not found', async () => {
    mockRoomModel.findById.mockResolvedValue(null);
    await expect(roomService.removeRoom('r1')).rejects.toThrow();
  });
});