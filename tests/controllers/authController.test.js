import { jest } from '@jest/globals';

const mockAuthService = {
  registerUser: jest.fn(),
  loginUser: jest.fn(),
};

jest.unstable_mockModule('../../src/services/authService.js', () => mockAuthService);

const authController = await import('../../src/controllers/authController.js');

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('register: should return 201 with token', async () => {
    req.body = { email: 'new@test.com' };
    const result = { token: 'abc', user: { id: 1 } };
    mockAuthService.registerUser.mockResolvedValue(result);

    await authController.register(req, res, next);

    expect(mockAuthService.registerUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    // FIXED: Expect data to be nested in 'data' property
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ token: 'abc' })
    }));
  });

  it('login: should return 200 with token', async () => {
    req.body = { email: 'test@test.com', password: '123' };
    const result = { token: 'xyz', user: { id: 1 } };
    mockAuthService.loginUser.mockResolvedValue(result);

    await authController.login(req, res, next);

    expect(mockAuthService.loginUser).toHaveBeenCalledWith('test@test.com', '123');
    expect(res.status).toHaveBeenCalledWith(200);
    // FIXED: Expect data to be nested in 'data' property
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ token: 'xyz' })
    }));
  });

  it('should pass errors to next', async () => {
    const error = new Error('Auth Failed');
    mockAuthService.loginUser.mockRejectedValue(error);
    await authController.login(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});