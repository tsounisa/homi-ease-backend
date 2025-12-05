import { jest } from '@jest/globals';

// Define Mocks
const mockAutomationModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

// Force DB Connection
const mockDbConfig = { db: { isConnected: true } };

// Register Mocks
jest.unstable_mockModule('../../src/models/Automation.js', () => ({ default: mockAutomationModel }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

// Import Service
const automationService = await import('../../src/services/automationService.js');

describe('AutomationService [DB Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAutomations: should query Mongoose by userId', async () => {
    const mockAutos = [{ name: 'A1' }];
    mockAutomationModel.find.mockResolvedValue(mockAutos);
    
    const res = await automationService.getAutomations('u1');
    
    expect(mockAutomationModel.find).toHaveBeenCalledWith({ userId: 'u1' });
    expect(res).toEqual(mockAutos);
  });

  it('getAutomationById: should return specific doc', async () => {
    const mockAuto = { _id: 'a1', name: 'A1' };
    mockAutomationModel.findOne.mockResolvedValue(mockAuto);

    const res = await automationService.getAutomationById('a1', 'u1');
    
    expect(mockAutomationModel.findOne).toHaveBeenCalledWith({ _id: 'a1', userId: 'u1' });
    expect(res).toEqual(mockAuto);
  });

  it('getAutomationById: should throw if not found', async () => {
    mockAutomationModel.findOne.mockResolvedValue(null);
    await expect(automationService.getAutomationById('a1', 'u1')).rejects.toThrow();
  });

  it('createAutomation: should create document', async () => {
    const autoData = { name: 'New' };
    const createdAuto = { _id: 'new', ...autoData, userId: 'u1' };
    mockAutomationModel.create.mockResolvedValue(createdAuto);

    const res = await automationService.createAutomation('u1', autoData);
    
    expect(mockAutomationModel.create).toHaveBeenCalledWith({ ...autoData, userId: 'u1' });
    expect(res).toHaveProperty('_id');
  });

  it('updateAutomation: should update document', async () => {
    mockAutomationModel.findOneAndUpdate.mockResolvedValue({ name: 'Updated' });

    const res = await automationService.updateAutomation('a1', 'u1', { name: 'Updated' });
    
    expect(mockAutomationModel.findOneAndUpdate).toHaveBeenCalled();
    expect(res.name).toBe('Updated');
  });

  it('updateAutomation: should throw if not found', async () => {
    mockAutomationModel.findOneAndUpdate.mockResolvedValue(null);
    await expect(automationService.updateAutomation('a1', 'u1', {})).rejects.toThrow();
  });

  it('deleteAutomation: should delete document', async () => {
    const mockDoc = { deleteOne: jest.fn() };
    mockAutomationModel.findOne.mockResolvedValue(mockDoc);

    await automationService.deleteAutomation('a1', 'u1');
    
    expect(mockAutomationModel.findOne).toHaveBeenCalledWith({ _id: 'a1', userId: 'u1' });
    expect(mockDoc.deleteOne).toHaveBeenCalled();
  });

  it('deleteAutomation: should throw if not found', async () => {
    mockAutomationModel.findOne.mockResolvedValue(null);
    await expect(automationService.deleteAutomation('a1', 'u1')).rejects.toThrow();
  });
});