import { jest } from '@jest/globals';

// FORCE DB DISCONNECTED
const mockDbConfig = {
  db: { isConnected: false }
};

const mockDataStore = {
  mockHouses: [],
  mockUsers: [],
  mockRooms: []
};

// Register Mocks
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);
jest.unstable_mockModule('../../src/config/mockData.js', () => mockDataStore);
// Mock models to avoid import errors (even if unused)
jest.unstable_mockModule('../../src/models/House.js', () => ({ default: {} }));
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: {} }));

// Import Service
const houseService = await import('../../src/services/houseService.js');

describe('HouseService [Mock Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataStore.mockHouses.length = 0;
    mockDataStore.mockUsers.length = 0;
    mockDataStore.mockRooms.length = 0;
  });

  it('getHousesForUser: should filter mock arrays', async () => {
    mockDataStore.mockHouses.push({ _id: 'h1', userId: 'u1' });
    const res = await houseService.getHousesForUser('u1');
    expect(res).toHaveLength(1);
  });

  it('getHouseById: should find and populate rooms', async () => {
    mockDataStore.mockRooms.push({ _id: 'r1', name: 'Living Room' });
    mockDataStore.mockHouses.push({ _id: 'h1', userId: 'u1', rooms: ['r1'] });

    const res = await houseService.getHouseById('h1', 'u1');
    expect(res._id).toBe('h1');
    expect(res.rooms[0].name).toBe('Living Room');
  });

  it('addHouse: should push to mock array', async () => {
    mockDataStore.mockUsers.push({ _id: 'u1', houses: [] });
    await houseService.addHouse('u1', { name: 'New' });
    expect(mockDataStore.mockHouses).toHaveLength(1);
  });

  it('addHouse: should succeed even if user not found', async () => {
    const res = await houseService.addHouse('u99', { name: 'Ghost House' });
    expect(res.userId).toBe('u99');
    expect(mockDataStore.mockHouses).toHaveLength(1);
  });

  it('updateHouse: should update in memory', async () => {
    mockDataStore.mockHouses.push({ _id: 'h1', userId: 'u1', name: 'Old' });
    const res = await houseService.updateHouse('h1', 'u1', { name: 'New' });
    expect(res.name).toBe('New');
  });

  it('removeHouse: should splice from memory', async () => {
    mockDataStore.mockHouses.push({ _id: 'h1', userId: 'u1' });
    mockDataStore.mockUsers.push({ _id: 'u1', houses: ['h1'] });
    await houseService.removeHouse('h1', 'u1');
    expect(mockDataStore.mockHouses).toHaveLength(0);
  });

  it('getHouseById: should throw if not found', async () => {
    await expect(houseService.getHouseById('bad', 'u1')).rejects.toThrow();
  });

  it('updateHouse: should throw if not found', async () => {
    await expect(houseService.updateHouse('bad', 'u1', {})).rejects.toThrow();
  });

  it('removeHouse: should throw if not found', async () => {
    await expect(houseService.removeHouse('bad', 'u1')).rejects.toThrow();
  });
});