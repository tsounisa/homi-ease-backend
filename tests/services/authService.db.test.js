import { jest } from '@jest/globals';

// --- Mocks ---
const mockUserInstance = {
  _id: 'u1',
  // Mock the instance method matchPassword
  matchPassword: jest.fn(), 
};

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('fake_token'),
};

const mockDbConfig = { db: { isConnected: true } };

// --- Register Mocks ---
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: mockUserModel }));
jest.unstable_mockModule('jsonwebtoken', () => ({ default: mockJwt }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

// --- Import Service ---
const authService = await import('../../src/services/authService.js');

describe('AuthService [DB Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------
  // LOGIN TESTS 
  // ---------------------------------------------------------
  describe('loginUser', () => {
    it('should select password, validate hash, and return token', async () => {
      // Mock the Mongoose Chain: findOne() -> select() -> result
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUserInstance)
      };
      mockUserModel.findOne.mockReturnValue(mockQuery);
      
      // Mock successful password match
      mockUserInstance.matchPassword.mockResolvedValue(true);

      const res = await authService.loginUser('test@test.com', 'pass');

      // 1. Verify we searched by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      // 2. CRITICAL: Verify we explicitly requested the password field
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
      // 3. Verify validation
      expect(mockUserInstance.matchPassword).toHaveBeenCalledWith('pass');
      expect(res).toHaveProperty('token', 'fake_token');
    });

    it('should throw if user not found', async () => {
      const mockQuery = { select: jest.fn().mockResolvedValue(null) };
      mockUserModel.findOne.mockReturnValue(mockQuery);

      await expect(authService.loginUser('bad@email.com', '123'))
        .rejects.toThrow(/invalid credentials/i);
    });

    it('should throw if password invalid', async () => {
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUserInstance) };
      mockUserModel.findOne.mockReturnValue(mockQuery);
      mockUserInstance.matchPassword.mockResolvedValue(false); // Wrong pass

      await expect(authService.loginUser('test@test.com', 'wrong'))
        .rejects.toThrow(/invalid credentials/i);
    });
  });

  // ---------------------------------------------------------
  // REGISTER TESTS 
  // ---------------------------------------------------------
  describe('registerUser', () => {
    it('should check for duplicates and create user', async () => {
      // 1. Mock "User not found" (email is free)
      mockUserModel.findOne.mockResolvedValue(null);
      // 2. Mock creation
      mockUserModel.create.mockResolvedValue({ _id: 'new-u1', email: 'new@test.com' });

      const res = await authService.registerUser({ 
        name: 'New', 
        email: 'new@test.com', 
        password: '123' 
      });

      // Assertions
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'new@test.com' });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockJwt.sign).toHaveBeenCalled(); // Should assume auto-login on register
      expect(res).toHaveProperty('token');
    });

    it('should throw if email already exists', async () => {
      // Mock "User found"
      mockUserModel.findOne.mockResolvedValue({ _id: 'existing' });

      await expect(authService.registerUser({ email: 'taken@test.com' }))
        .rejects.toThrow(/already exists/i);
      
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });
});