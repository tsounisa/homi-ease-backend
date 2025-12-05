import { jest } from '@jest/globals';

const mockScenarioModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

const mockDbConfig = { db: { isConnected: true } };

jest.unstable_mockModule('../../src/models/Scenario.js', () => ({ default: mockScenarioModel }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

const scenarioService = await import('../../src/services/scenarioService.js');

describe('ScenarioService [DB Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getScenarios: should query by userId', async () => {
    mockScenarioModel.find.mockResolvedValue(['s1']);
    
    const res = await scenarioService.getScenarios('u1');
    
    expect(mockScenarioModel.find).toHaveBeenCalledWith({ userId: 'u1' });
    expect(res).toEqual(['s1']);
  });

  it('getScenarioById: should return doc', async () => {
    mockScenarioModel.findOne.mockResolvedValue('s1');
    const res = await scenarioService.getScenarioById('s1', 'u1');
    expect(mockScenarioModel.findOne).toHaveBeenCalledWith({ _id: 's1', userId: 'u1' });
    expect(res).toBe('s1');
  });

  it('getScenarioById: should throw if not found', async () => {
    mockScenarioModel.findOne.mockResolvedValue(null);
    await expect(scenarioService.getScenarioById('s1', 'u1')).rejects.toThrow();
  });

  it('createScenario: should create doc', async () => {
    const sceneData = { 
      name: 'Morning', 
      actions: [{ deviceId: 'd1', command: {} }, { deviceId: 'd2', command: {} }] 
    };
    mockScenarioModel.create.mockResolvedValue({ _id: 's1', ...sceneData });

    const res = await scenarioService.createScenario('u1', sceneData);

    expect(mockScenarioModel.create).toHaveBeenCalledWith({ ...sceneData, userId: 'u1' });
    expect(res).toHaveProperty('_id', 's1');
  });

  it('updateScenario: should update doc', async () => {
    mockScenarioModel.findOneAndUpdate.mockResolvedValue('updated');
    const res = await scenarioService.updateScenario('s1', 'u1', {});
    expect(mockScenarioModel.findOneAndUpdate).toHaveBeenCalled();
    expect(res).toBe('updated');
  });

  it('updateScenario: should throw if not found', async () => {
    mockScenarioModel.findOneAndUpdate.mockResolvedValue(null);
    await expect(scenarioService.updateScenario('s1', 'u1', {})).rejects.toThrow();
  });

  it('deleteScenario: should delete doc', async () => {
    const mockDoc = { deleteOne: jest.fn() };
    mockScenarioModel.findOne.mockResolvedValue(mockDoc);
    await scenarioService.deleteScenario('s1', 'u1');
    expect(mockDoc.deleteOne).toHaveBeenCalled();
  });

  it('deleteScenario: should throw if not found', async () => {
    mockScenarioModel.findOne.mockResolvedValue(null);
    await expect(scenarioService.deleteScenario('s1', 'u1')).rejects.toThrow();
  });
});