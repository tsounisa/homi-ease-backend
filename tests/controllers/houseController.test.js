import { jest } from '@jest/globals';

// 1. Define Service Mocks
const mockHouseService = {
  getHousesForUser: jest.fn(),
  getHouseById: jest.fn(),
  addHouse: jest.fn(),
  updateHouse: jest.fn(),
  removeHouse: jest.fn(),
};

// 2. Register Mocks BEFORE import
jest.unstable_mockModule('../../src/services/houseService.js', () => mockHouseService);

// 3. Import Controller
const houseController = await import('../../src/controllers/houseController.js');

describe('HouseController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Express Objects
    req = {
      user: { _id: 'user-1' }, // Simulate authenticated user
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(), // Allow chaining .status().json()
      json: jest.fn()
    };

    next = jest.fn(); // Mock error handler
  });

  // --- GET HOUSES ---
  describe('getHouses', () => {
    it('should return list of houses with 200 status', async () => {
      const mockHouses = [{ name: 'H1' }];
      mockHouseService.getHousesForUser.mockResolvedValue(mockHouses);

      await houseController.getHouses(req, res, next);

      expect(mockHouseService.getHousesForUser).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockHouses
      }));
    });

    it('should pass errors to next middleware', async () => {
      const error = new Error('Database Fail');
      mockHouseService.getHousesForUser.mockRejectedValue(error);

      await houseController.getHouses(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- GET HOUSE BY ID ---
  describe('getHouse', () => {
    it('should return house details', async () => {
      req.params.houseId = 'h1';
      const mockHouse = { _id: 'h1', name: 'My House' };
      mockHouseService.getHouseById.mockResolvedValue(mockHouse);

      await houseController.getHouse(req, res, next);

      expect(mockHouseService.getHouseById).toHaveBeenCalledWith('h1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockHouse
      }));
    });
  });

  // --- ADD HOUSE ---
  describe('addHouse', () => {
    it('should create house and return 201', async () => {
      req.body = { name: 'New House' };
      const createdHouse = { _id: 'h2', name: 'New House' };
      mockHouseService.addHouse.mockResolvedValue(createdHouse);

      await houseController.addHouse(req, res, next);

      expect(mockHouseService.addHouse).toHaveBeenCalledWith('user-1', req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: createdHouse
      }));
    });
  });

  // --- UPDATE HOUSE ---
  describe('updateHouse', () => {
    it('should update house and return 200', async () => {
      req.params.houseId = 'h1';
      req.body = { name: 'Updated' };
      const updatedHouse = { _id: 'h1', name: 'Updated' };
      mockHouseService.updateHouse.mockResolvedValue(updatedHouse);

      await houseController.updateHouse(req, res, next);

      expect(mockHouseService.updateHouse).toHaveBeenCalledWith('h1', 'user-1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: updatedHouse
      }));
    });
  });

  // --- REMOVE HOUSE ---
  describe('removeHouse', () => {
    it('should remove house and return 200', async () => {
      req.params.houseId = 'h1';
      const result = { _id: 'h1', status: 'removed' };
      mockHouseService.removeHouse.mockResolvedValue(result);

      await houseController.removeHouse(req, res, next);

      expect(mockHouseService.removeHouse).toHaveBeenCalledWith('h1', 'user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: result
      }));
    });
  });
});