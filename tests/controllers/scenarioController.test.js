import { jest } from '@jest/globals';

// 1. Define Mocks
const mockScenarioService = {
  getScenarios: jest.fn(),
  getScenarioById: jest.fn(),
  createScenario: jest.fn(),
  updateScenario: jest.fn(),
  deleteScenario: jest.fn(),
};

// 2. Register Mock
jest.unstable_mockModule('../../src/services/scenarioService.js', () => mockScenarioService);

// 3. Import Controller
const scenarioController = await import('../../src/controllers/scenarioController.js');

describe('ScenarioController', () => {
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

  it('getScenarios: should return 200 with list', async () => {
    const list = [{ name: 'Scene 1' }];
    mockScenarioService.getScenarios.mockResolvedValue(list);

    await scenarioController.getScenarios(req, res, next);

    expect(mockScenarioService.getScenarios).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: list }));
  });

  it('getScenario: should return 200 with specific doc', async () => {
    req.params.scenarioId = 's1';
    const doc = { name: 'Scene 1' };
    mockScenarioService.getScenarioById.mockResolvedValue(doc);

    await scenarioController.getScenario(req, res, next);

    expect(mockScenarioService.getScenarioById).toHaveBeenCalledWith('s1', 'u1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('createScenario: should return 201 with created doc', async () => {
    req.body = { name: 'New Scene' };
    const created = { _id: 's1', ...req.body };
    mockScenarioService.createScenario.mockResolvedValue(created);

    await scenarioController.createScenario(req, res, next);

    expect(mockScenarioService.createScenario).toHaveBeenCalledWith('u1', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updateScenario: should return 200 with updated doc', async () => {
    req.params.scenarioId = 's1';
    req.body = { name: 'Updated' };
    mockScenarioService.updateScenario.mockResolvedValue(req.body);

    await scenarioController.updateScenario(req, res, next);

    expect(mockScenarioService.updateScenario).toHaveBeenCalledWith('s1', 'u1', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deleteScenario: should return 200 with result', async () => {
    req.params.scenarioId = 's1';
    mockScenarioService.deleteScenario.mockResolvedValue({ status: 'removed' });

    await scenarioController.deleteScenario(req, res, next);

    expect(mockScenarioService.deleteScenario).toHaveBeenCalledWith('s1', 'u1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});