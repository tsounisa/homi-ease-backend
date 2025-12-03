import { jest } from '@jest/globals';

const mockDbConfig = { db: { isConnected: false } };
const mockDataStore = { mockUsers: [] };

jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);
jest.unstable_mockModule('../../src/config/mockData.js', () => mockDataStore);
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: {} }));

const userService = await import('../../src/services/userService.js');

describe('UserService [Mock Mode]', () => {
  beforeEach(() => { mockDataStore.mockUsers.length = 0; });

  it('getUserById: should find in array', async () => {
    mockDataStore.mockUsers.push({ _id: 'u1', name: 'Test' });
    const res = await userService.getUserById('u1');
    expect(res.name).toBe('Test');
  });

  it('getUserById: should throw if not found', async () => {
    await expect(userService.getUserById('bad')).rejects.toThrow();
  });
});