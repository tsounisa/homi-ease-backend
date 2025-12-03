import { jest } from '@jest/globals';
import { ApiError } from '../../src/utils/ApiError.js';

// 1. Define Mocks
const mockJwt = { verify: jest.fn() };
const mockUser = { findById: jest.fn() };
const mockDbConfig = { db: { isConnected: true } }; 

// 2. Register Mocks
jest.unstable_mockModule('jsonwebtoken', () => ({ default: mockJwt }));
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: mockUser }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

// 3. Import Middleware
const { protect } = await import('../../src/middleware/auth.js');

describe('Middleware: Auth (protect)', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it('should call next() if token is valid and user exists', async () => {
    req.headers.authorization = 'Bearer valid_token';
    const decoded = { id: 'u1' };
    const user = { _id: 'u1', name: 'Test' };

    mockJwt.verify.mockReturnValue(decoded);
    mockUser.findById.mockResolvedValue(user);

    await protect(req, res, next);

    expect(mockJwt.verify).toHaveBeenCalledWith('valid_token', expect.any(String));
    expect(mockUser.findById).toHaveBeenCalledWith('u1');
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalledWith(); // Success
  });

  it('should throw 401 if no authorization header', async () => {
    await protect(req, res, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toMatch(/not logged in/i);
  });

  it('should throw 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer bad_token';
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    
    mockJwt.verify.mockImplementation(() => { throw error; });

    await protect(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toMatch(/Invalid token/i);
  });

  it('should throw 401 if user no longer exists', async () => {
    req.headers.authorization = 'Bearer valid_token';
    mockJwt.verify.mockReturnValue({ id: 'u1' });
    mockUser.findById.mockResolvedValue(null); // User deleted

    await protect(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toMatch(/user belonging to this token/i);
  });
});