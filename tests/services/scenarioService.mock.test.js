import { jest } from '@jest/globals';

const mockDbConfig = { db: { isConnected: false } };
const mockDataStore = { mockScenarios: [] };

jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);
jest.unstable_mockModule('../../src/config/mockData.js', () => mockDataStore);
jest.unstable_mockModule('../../src/models/Scenario.js', () => ({ default: {} }));

const scenarioService = await import('../../src/services/scenarioService.js');

describe('ScenarioService [Mock Mode]', () => {
  beforeEach(() => {
    mockDataStore.mockScenarios.length = 0;
  });

  it('getScenarios: should filter array', async () => {
    mockDataStore.mockScenarios.push({ _id: 's1', userId: 'u1' });
    const res = await scenarioService.getScenarios('u1');
    expect(res).toHaveLength(1);
  });

  it('createScenario: should push to array', async () => {
    // We must provide valid actions (>1) to pass validation
    const validData = { 
      name: 'S1', 
      actions: [{ deviceId: 'd1', command: {} }, { deviceId: 'd2', command: {} }] 
    };
    const res = await scenarioService.createScenario('u1', validData);
    expect(mockDataStore.mockScenarios).toHaveLength(1);
  });

  it('createScenario: should throw if actions < 2', async () => {
    const invalidData = { name: 'Bad', actions: [] };
    await expect(scenarioService.createScenario('u1', invalidData)).rejects.toThrow();
  });

  it('updateScenario: should update in memory', async () => {
    mockDataStore.mockScenarios.push({ _id: 's1', userId: 'u1', name: 'Old' });
    const res = await scenarioService.updateScenario('s1', 'u1', { name: 'New' });
    expect(res.name).toBe('New');
  });

  it('deleteScenario: should splice from memory', async () => {
    mockDataStore.mockScenarios.push({ _id: 's1', userId: 'u1' });
    await scenarioService.deleteScenario('s1', 'u1');
    expect(mockDataStore.mockScenarios).toHaveLength(0);
  });

  // --- NEW TESTS FOR LINES 29-31 ---
  it('getScenarioById: should find in mock array', async () => {
    mockDataStore.mockScenarios.push({ _id: 's1', userId: 'u1', name: 'Target' });
    const res = await scenarioService.getScenarioById('s1', 'u1');
    expect(res.name).toBe('Target');
  });

  it('getScenarioById: should throw if not found', async () => {
    await expect(scenarioService.getScenarioById('bad-id', 'u1'))
      .rejects.toThrow('Scenario not found');
  });
});