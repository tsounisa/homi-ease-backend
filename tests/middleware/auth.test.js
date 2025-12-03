import { jest } from '@jest/globals';
import { ApiError } from '../../src/utils/ApiError.js';

const mockJwt = { verify: jest.fn() };
const mockUser = { findById: jest.fn() };
const mockDbConfig = { db: { isConnected: true } };

jest.unstable_mockModule('jsonwebtoken', () => ({ default: mockJwt }));
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: mockUser }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

const { protect } = await import('../../src/middleware/auth.js');

describe('Middleware: Auth (protect)', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    next = jest.fn();
  });

  // ... (Keep existing success test) ...
  it('should call next() if valid', async () => {
    req.headers.authorization = 'Bearer valid';
    mockJwt.verify.mockReturnValue({ id: 'u1' });
    mockUser.findById.mockResolvedValue({ _id: 'u1' });
    await protect(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  // --- NEW TEST FOR LINE 40 (User Deleted) ---
  it('should throw 401 if user no longer exists', async () => {
    req.headers.authorization = 'Bearer valid';
    mockJwt.verify.mockReturnValue({ id: 'u1' });
    // Simulate user deleted from DB
    mockUser.findById.mockResolvedValue(null); 

    await protect(req, res, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toMatch(/user belonging to this token/i);
  });

  // --- NEW TEST FOR LINES 59-62 (Token Expired) ---
  it('should throw 401 if token expired', async () => {
    req.headers.authorization = 'Bearer expired_token';
    const error = new Error('Expired');
    error.name = 'TokenExpiredError'; // <--- Critical for line 61
    
    mockJwt.verify.mockImplementation(() => { throw error; });

    await protect(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toMatch(/token has expired/i);
  });

  // --- NEW TEST FOR JSON WEB TOKEN ERROR ---
  it('should throw 401 if token invalid', async () => {
    req.headers.authorization = 'Bearer bad';
    const error = new Error('Invalid');
    error.name = 'JsonWebTokenError';
    
    mockJwt.verify.mockImplementation(() => { throw error; });

    await protect(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toMatch(/Invalid token/i);
  });
});