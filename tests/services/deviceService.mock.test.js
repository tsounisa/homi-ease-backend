import { jest } from '@jest/globals';

const mockDbConfig = { db: { isConnected: false } };

const mockDataStore = {
  mockDevices: [],
  mockRooms: []
};

jest.unstable_mockModule('../../src/config/database.js', () => mockDbConfig);
jest.unstable_mockModule('../../src/config/mockData.js', () => mockDataStore);
// Mock models to satisfy imports
jest.unstable_mockModule('../../src/models/Device.js', () => ({ default: {} }));
jest.unstable_mockModule('../../src/models/Room.js', () => ({ default: {} }));

const deviceService = await import('../../src/services/deviceService.js');

describe('DeviceService [Mock Mode]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataStore.mockDevices.length = 0;
    mockDataStore.mockRooms.length = 0;
  });

  it('getDevicesByRoomId: should filter mock arrays', async () => {
    mockDataStore.mockDevices.push({ _id: 'd1', roomId: 'r1', name: 'Light' });
    const res = await deviceService.getDevicesByRoomId('r1');
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Light');
  });

  it('getDeviceById: should find in mock array', async () => {
    mockDataStore.mockDevices.push({ _id: 'd1', name: 'Thermo' });
    const res = await deviceService.getDeviceById('d1');
    expect(res.name).toBe('Thermo');
  });

  it('getDeviceById: should throw if not found', async () => {
    await expect(deviceService.getDeviceById('bad')).rejects.toThrow();
  });

  it('addDevice: should push to mock array with Correct Status Object', async () => {
    mockDataStore.mockRooms.push({ _id: 'r1', devices: [] });
    
    // Test that our refactor (status fallback) works
    const res = await deviceService.addDevice('r1', { name: 'New Dev', type: 'light' });
    
    expect(mockDataStore.mockDevices).toHaveLength(1);
    expect(res.status).toEqual({ isOn: false }); // Confirms the object structure
    expect(res.type).toBe('light');
  });

  it('addDevice: should throw if Room not found', async () => {
    await expect(deviceService.addDevice('bad-room', {})).rejects.toThrow('Room not found');
  });

  it('updateDevice: should update object in memory', async () => {
    mockDataStore.mockDevices.push({ _id: 'd1', status: { isOn: false } });
    
    const res = await deviceService.updateDevice('d1', { status: { isOn: true } });
    
    expect(res.status.isOn).toBe(true);
    expect(mockDataStore.mockDevices[0].status.isOn).toBe(true);
  });

  it('updateDevice: should throw if not found', async () => {
    await expect(deviceService.updateDevice('bad', {})).rejects.toThrow();
  });

  it('removeDevice: should splice from memory and update room', async () => {
    mockDataStore.mockDevices.push({ _id: 'd1', roomId: 'r1' });
    mockDataStore.mockRooms.push({ _id: 'r1', devices: ['d1'] });

    await deviceService.removeDevice('d1');

    expect(mockDataStore.mockDevices).toHaveLength(0);
    const room = mockDataStore.mockRooms.find(r => r._id === 'r1');
    expect(room.devices).toHaveLength(0);
  });

  it('removeDevice: should throw if not found', async () => {
    await expect(deviceService.removeDevice('bad')).rejects.toThrow();
  });
});