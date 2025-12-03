import { jest } from '@jest/globals';

const mockUserService = {
  getUserById: jest.fn(),
};

jest.unstable_mockModule('../../src/services/userService.js', () => mockUserService);

const userController = await import('../../src/controllers/userController.js');

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'u1' } }; // Simulating auth middleware
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('getMe: should return current user profile', async () => {
    const mockProfile = { name: 'Test' };
    mockUserService.getUserById.mockResolvedValue(mockProfile);

    await userController.getMe(req, res, next);

    expect(mockUserService.getUserById).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: mockProfile
    }));
  });
});