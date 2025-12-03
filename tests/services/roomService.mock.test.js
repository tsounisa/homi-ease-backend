import { jest } from '@jest/globals';

// 1. Define Mocks
const mockDbConfig = { db: { isConnected: false } };

const mockDataStore = {
  mockRooms: [],
  mockHouses: []
};

// 2. Register Mocks
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);
jest.unstable_mockModule('../../src/config/mockData.js', () => mockDataStore);
// Mock models to avoid import errors
jest.unstable_mockModule('../../src/models/Room.js', () => ({ default: {} }));
jest.unstable_mockModule('../../src/models/House.js', () => ({ default: {} }));

// 3. Import Service
const roomService = await import('../../src/services/roomService.js');

describe('RoomService [Mock Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataStore.mockRooms.length = 0;
    mockDataStore.mockHouses.length = 0;
  });

  it('getRoomsInHouse: should filter mock arrays', async () => {
    mockDataStore.mockRooms.push({ _id: 'r1', houseId: 'h1', name: 'Kitchen' });
    const res = await roomService.getRoomsInHouse('h1');
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Kitchen');
  });

  it('getRoomById: should find in mock array', async () => {
    mockDataStore.mockRooms.push({ _id: 'r1', name: 'Kitchen' });
    const res = await roomService.getRoomById('r1');
    expect(res.name).toBe('Kitchen');
  });

  it('getRoomById: should throw if not found', async () => {
    await expect(roomService.getRoomById('bad')).rejects.toThrow();
  });

  it('addRoomToHouse: should push to mock array', async () => {
    mockDataStore.mockHouses.push({ _id: 'h1', rooms: [] });
    
    const res = await roomService.addRoomToHouse('h1', { name: 'Bedroom' });
    
    expect(mockDataStore.mockRooms).toHaveLength(1);
    expect(res.houseId).toBe('h1');
    expect(res.name).toBe('Bedroom');
  });

  it('addRoomToHouse: should throw if house not found', async () => {
    await expect(roomService.addRoomToHouse('bad-house', {})).rejects.toThrow('House not found');
  });

  it('updateRoom: should update in memory', async () => {
    mockDataStore.mockRooms.push({ _id: 'r1', name: 'Old' });
    const res = await roomService.updateRoom('r1', { name: 'New' });
    expect(res.name).toBe('New');
  });

  it('updateRoom: should throw if not found', async () => {
    await expect(roomService.updateRoom('bad', {})).rejects.toThrow();
  });

  it('removeRoom: should splice from memory', async () => {
    mockDataStore.mockRooms.push({ _id: 'r1', houseId: 'h1' });
    mockDataStore.mockHouses.push({ _id: 'h1', rooms: ['r1'] });

    await roomService.removeRoom('r1');

    expect(mockDataStore.mockRooms).toHaveLength(0);
    const house = mockDataStore.mockHouses.find(h => h._id === 'h1');
    expect(house.rooms).toHaveLength(0);
  });

  it('removeRoom: should throw if not found', async () => {
    await expect(roomService.removeRoom('bad')).rejects.toThrow();
  });
});