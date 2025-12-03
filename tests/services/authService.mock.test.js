import { jest } from '@jest/globals';

const mockDbConfig = { db: { isConnected: false } };
const mockDataStore = { mockUsers: [] };

// --- Register Mocks ---
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);
jest.unstable_mockModule('../../src/config/mockData.js', () => mockDataStore);
// Mock models to prevent crashes
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: {} }));

// Mock bcrypt/jwt for manual logic
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn().mockResolvedValue('hashed_pw'),
    genSalt: jest.fn()
  }
}));
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: jest.fn().mockReturnValue('mock_token') }
}));

// --- Import Service ---
// We import bcrypt to control the mock behavior inside the test
const bcrypt = (await import('bcryptjs')).default;
const authService = await import('../../src/services/authService.js');

describe('AuthService [Mock Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataStore.mockUsers.length = 0;
  });

  // ---------------------------------------------------------
  // LOGIN TESTS
  // ---------------------------------------------------------
  describe('loginUser', () => {
    it('should find user in array and verify password', async () => {
      mockDataStore.mockUsers.push({ 
        _id: 'u1', 
        email: 'test@test.com', 
        password: 'hashed_secret' 
      });
      
      bcrypt.compare.mockResolvedValue(true); 

      const res = await authService.loginUser('test@test.com', 'secret');

      expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed_secret');
      expect(res.token).toBe('mock_token');
    });

    it('should throw if user not in array', async () => {
      await expect(authService.loginUser('missing@test.com', '123'))
        .rejects.toThrow(/invalid credentials/i);
    });
  });

  // ---------------------------------------------------------
  // REGISTER TESTS
  // ---------------------------------------------------------
  describe('registerUser', () => {
    it('should push new user to mock array', async () => {
      const userData = { name: 'Test', email: 'test@test.com', password: '123' };
      
      const res = await authService.registerUser(userData);

      expect(mockDataStore.mockUsers).toHaveLength(1);
      expect(mockDataStore.mockUsers[0].email).toBe('test@test.com');
      // Should hash password even in mock mode
      expect(bcrypt.hash).toHaveBeenCalled(); 
      expect(res).toHaveProperty('token');
    });

    it('should prevent duplicate emails in mock data', async () => {
      mockDataStore.mockUsers.push({ email: 'taken@test.com' });

      await expect(authService.registerUser({ email: 'taken@test.com' }))
        .rejects.toThrow(/already exists/i);
    });
  });
});