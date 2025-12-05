import { jest } from '@jest/globals';

// 1. Define Mocks
const mockDeviceModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockRoomModel = {
  findByIdAndUpdate: jest.fn(),
};

const mockDbConfig = { db: { isConnected: true } };

// 2. Register Mocks
jest.unstable_mockModule('../../src/models/Device.js', () => ({ default: mockDeviceModel }));
jest.unstable_mockModule('../../src/models/Room.js', () => ({ default: mockRoomModel }));
jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);

// 3. Import Service
const deviceService = await import('../../src/services/deviceService.js');

describe('DeviceService [DB Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getDevicesByRoomId: should query Mongoose', async () => {
    const mockDevices = [{ _id: 'd1', name: 'Light', type: 'light' }];
    mockDeviceModel.find.mockResolvedValue(mockDevices);
    
    const res = await deviceService.getDevicesByRoomId('r1');
    
    expect(mockDeviceModel.find).toHaveBeenCalledWith({ room: 'r1' });
    expect(res).toEqual(mockDevices);
  });

  it('getDeviceById: should return device', async () => {
    const mockDevice = { _id: 'd1', status: { isOn: true } };
    mockDeviceModel.findById.mockResolvedValue(mockDevice);
    
    const res = await deviceService.getDeviceById('d1');
    
    expect(res._id).toBe('d1');
    expect(res.status.isOn).toBe(true);
  });

  it('getDeviceById: should throw if not found', async () => {
    mockDeviceModel.findById.mockResolvedValue(null);
    await expect(deviceService.getDeviceById('d1')).rejects.toThrow();
  });

  it('addDevice: should create and link to Room', async () => {
    const deviceData = { name: 'Lamp', type: 'light' };
    const createdDevice = { _id: 'd1', ...deviceData };
    
    mockDeviceModel.create.mockResolvedValue(createdDevice);
    mockRoomModel.findByIdAndUpdate.mockResolvedValue(true);

    const res = await deviceService.addDevice('r1', deviceData);

    expect(mockDeviceModel.create).toHaveBeenCalledWith({ ...deviceData, room: 'r1' });
    expect(mockRoomModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'r1', 
      { $push: { devices: 'd1' } }
    );
    expect(res).toEqual(createdDevice);
  });

  it('updateDevice: should update via Mongoose', async () => {
    const updates = { status: { isOn: false } };
    mockDeviceModel.findByIdAndUpdate.mockResolvedValue({ _id: 'd1', ...updates });

    const res = await deviceService.updateDevice('d1', updates);
    
    expect(mockDeviceModel.findByIdAndUpdate).toHaveBeenCalled();
    expect(res.status.isOn).toBe(false);
  });

  it('updateDevice: should throw if not found', async () => {
    mockDeviceModel.findByIdAndUpdate.mockResolvedValue(null);
    await expect(deviceService.updateDevice('d1', {})).rejects.toThrow();
  });

  it('removeDevice: should delete and unlink from Room', async () => {
    const mockDevice = { _id: 'd1', room: 'r1', deleteOne: jest.fn() };
    mockDeviceModel.findById.mockResolvedValue(mockDevice);
    mockRoomModel.findByIdAndUpdate.mockResolvedValue(true);

    await deviceService.removeDevice('d1');

    expect(mockDevice.deleteOne).toHaveBeenCalled();
    expect(mockRoomModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'r1',
      { $pull: { devices: 'd1' } }
    );
  });

  it('removeDevice: should throw if not found', async () => {
    mockDeviceModel.findById.mockResolvedValue(null);
    await expect(deviceService.removeDevice('d1')).rejects.toThrow();
  });
});