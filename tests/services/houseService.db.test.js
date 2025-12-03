import { jest } from '@jest/globals';

// 1. Define Mocks
const mockHouseModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockUserModel = {
  findByIdAndUpdate: jest.fn(),
};

// FORCE DB CONNECTED
const mockDbConfig = {
  db: { isConnected: true }
};

// 2. Register Mocks
jest.unstable_mockModule('../../src/models/House.js', () => ({ default: mockHouseModel }));
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: mockUserModel }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

// 3. Import Service
const houseService = await import('../../src/services/houseService.js');

describe('HouseService [DB Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getHousesForUser: should query Mongoose', async () => {
    mockHouseModel.find.mockResolvedValue(['house1']);
    const res = await houseService.getHousesForUser('u1');
    expect(mockHouseModel.find).toHaveBeenCalledWith({ userId: 'u1' });
    expect(res).toEqual(['house1']);
  });

  it('getHouseById: should return populated house', async () => {
    const mockHouse = { _id: 'h1', populate: jest.fn().mockResolvedValue('populated') };
    mockHouseModel.findOne.mockReturnValue(mockHouse);
    const res = await houseService.getHouseById('h1', 'u1');
    expect(res).toBe('populated');
  });

  it('getHouseById: should throw if not found', async () => {
    mockHouseModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    await expect(houseService.getHouseById('h1', 'u1')).rejects.toThrow();
  });

  it('addHouse: should create via Mongoose', async () => {
    const houseData = { name: 'DB House' };
    mockHouseModel.create.mockResolvedValue({ _id: 'h1', ...houseData });
    mockUserModel.findByIdAndUpdate.mockResolvedValue(true);
    await houseService.addHouse('u1', houseData);
    expect(mockHouseModel.create).toHaveBeenCalled();
  });

  it('updateHouse: should update via Mongoose', async () => {
    mockHouseModel.findOneAndUpdate.mockResolvedValue({ name: 'Updated' });
    const res = await houseService.updateHouse('h1', 'u1', {});
    expect(res.name).toBe('Updated');
  });

  it('updateHouse: should throw if not found', async () => {
    mockHouseModel.findOneAndUpdate.mockResolvedValue(null);
    await expect(houseService.updateHouse('h1', 'u1', {})).rejects.toThrow();
  });

  it('removeHouse: should delete via Mongoose', async () => {
    const mockHouse = { deleteOne: jest.fn() };
    mockHouseModel.findOne.mockResolvedValue(mockHouse);
    mockUserModel.findByIdAndUpdate.mockResolvedValue(true);
    await houseService.removeHouse('h1', 'u1');
    expect(mockHouse.deleteOne).toHaveBeenCalled();
  });

  it('removeHouse: should throw if not found', async () => {
    mockHouseModel.findOne.mockResolvedValue(null);
    await expect(houseService.removeHouse('h1', 'u1')).rejects.toThrow();
  });
});