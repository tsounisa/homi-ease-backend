import { jest } from '@jest/globals';

const mockUserModel = { findById: jest.fn() };
const mockDbConfig = { db: { isConnected: true } };

jest.unstable_mockModule('../../src/models/User.js', () => ({ default: mockUserModel }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

const userService = await import('../../src/services/userService.js');

describe('UserService [DB Mode]', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('getUserById: should return user without password', async () => {
    const mockUser = { _id: 'u1', name: 'Test', email: 'test@test.com' };
    mockUserModel.findById.mockResolvedValue(mockUser);

    const res = await userService.getUserById('u1');
    expect(mockUserModel.findById).toHaveBeenCalledWith('u1');
    expect(res).toEqual(mockUser);
  });

  it('getUserById: should throw if not found', async () => {
    mockUserModel.findById.mockResolvedValue(null);
    await expect(userService.getUserById('bad')).rejects.toThrow();
  });
});