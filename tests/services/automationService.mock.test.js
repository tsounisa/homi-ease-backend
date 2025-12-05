import { jest } from '@jest/globals';

// Force DB Disconnect
const mockDbConfig = { db: { isConnected: false } };
const mockDataStore = { mockAutomations: [] };

// Register Mocks
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);
jest.unstable_mockModule('../../src/config/mockData.js', () => mockDataStore);
jest.unstable_mockModule('../../src/models/Automation.js', () => ({ default: {} }));

// Import Service
const automationService = await import('../../src/services/automationService.js');

describe('AutomationService [Mock Mode]', () => {
  beforeEach(() => {
    mockDataStore.mockAutomations.length = 0;
  });

  it('getAutomations: should filter array', async () => {
    mockDataStore.mockAutomations.push({ _id: 'a1', userId: 'u1' }, { _id: 'a2', userId: 'u2' });
    
    const res = await automationService.getAutomations('u1');
    
    expect(res).toHaveLength(1);
    expect(res[0]._id).toBe('a1');
  });

  it('getAutomationById: should find in array', async () => {
    mockDataStore.mockAutomations.push({ _id: 'a1', userId: 'u1', name: 'Found' });
    const res = await automationService.getAutomationById('a1', 'u1');
    expect(res.name).toBe('Found');
  });

  it('getAutomationById: should throw if not found', async () => {
    await expect(automationService.getAutomationById('bad', 'u1')).rejects.toThrow();
  });

  it('createAutomation: should push to array', async () => {
    const res = await automationService.createAutomation('u1', { name: 'Test' });
    
    expect(mockDataStore.mockAutomations).toHaveLength(1);
    expect(res.userId).toBe('u1');
  });

  it('updateAutomation: should update in memory', async () => {
    mockDataStore.mockAutomations.push({ _id: 'a1', userId: 'u1', name: 'Old' });
    
    const res = await automationService.updateAutomation('a1', 'u1', { name: 'New' });
    
    expect(res.name).toBe('New');
    expect(mockDataStore.mockAutomations[0].name).toBe('New');
  });

  it('updateAutomation: should throw if not found', async () => {
    await expect(automationService.updateAutomation('bad', 'u1', {})).rejects.toThrow();
  });

  it('deleteAutomation: should splice from memory', async () => {
    mockDataStore.mockAutomations.push({ _id: 'a1', userId: 'u1' });
    
    await automationService.deleteAutomation('a1', 'u1');
    
    expect(mockDataStore.mockAutomations).toHaveLength(0);
  });

  it('deleteAutomation: should throw if not found', async () => {
    await expect(automationService.deleteAutomation('bad', 'u1')).rejects.toThrow();
  });
});