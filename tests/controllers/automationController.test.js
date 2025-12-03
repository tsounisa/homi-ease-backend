import { jest } from '@jest/globals';

// 1. Define Mocks
const mockAutomationService = {
  getAutomations: jest.fn(),
  getAutomationById: jest.fn(),
  createAutomation: jest.fn(),
  updateAutomation: jest.fn(),
  deleteAutomation: jest.fn(),
};

// 2. Register Mock
jest.unstable_mockModule('../../src/services/automationService.js', () => mockAutomationService);

// 3. Import Controller
const automationController = await import('../../src/controllers/automationController.js');

describe('AutomationController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { 
      user: { _id: 'u1' },
      params: {}, 
      body: {} 
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('getAutomations: should return 200 with list', async () => {
    const list = [{ name: 'Auto 1' }];
    mockAutomationService.getAutomations.mockResolvedValue(list);

    await automationController.getAutomations(req, res, next);

    expect(mockAutomationService.getAutomations).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: list }));
  });

  it('getAutomation: should return 200 with specific doc', async () => {
    req.params.automationId = 'a1';
    const doc = { name: 'Auto 1' };
    mockAutomationService.getAutomationById.mockResolvedValue(doc);

    await automationController.getAutomation(req, res, next);

    expect(mockAutomationService.getAutomationById).toHaveBeenCalledWith('a1', 'u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: doc }));
  });

  it('createAutomation: should return 201 with created doc', async () => {
    req.body = { name: 'New Auto' };
    const created = { _id: 'a1', ...req.body };
    mockAutomationService.createAutomation.mockResolvedValue(created);

    await automationController.createAutomation(req, res, next);

    expect(mockAutomationService.createAutomation).toHaveBeenCalledWith('u1', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: created }));
  });

  it('updateAutomation: should return 200 with updated doc', async () => {
    req.params.automationId = 'a1';
    req.body = { name: 'Updated' };
    mockAutomationService.updateAutomation.mockResolvedValue(req.body);

    await automationController.updateAutomation(req, res, next);

    expect(mockAutomationService.updateAutomation).toHaveBeenCalledWith('a1', 'u1', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deleteAutomation: should return 200 with result', async () => {
    req.params.automationId = 'a1';
    const result = { status: 'removed' };
    mockAutomationService.deleteAutomation.mockResolvedValue(result);

    await automationController.deleteAutomation(req, res, next);

    expect(mockAutomationService.deleteAutomation).toHaveBeenCalledWith('a1', 'u1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should pass errors to next()', async () => {
    const error = new Error('Service Fail');
    mockAutomationService.getAutomations.mockRejectedValue(error);
    await automationController.getAutomations(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});