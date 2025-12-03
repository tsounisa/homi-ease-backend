import { jest } from '@jest/globals';

// 1. Define Mocks
const mockDeviceService = {
  getDevicesByRoomId: jest.fn(),
  getDeviceById: jest.fn(),
  addDevice: jest.fn(),
  updateDevice: jest.fn(),
  removeDevice: jest.fn(),
};

// 2. Register Mock
jest.unstable_mockModule('../../src/services/deviceService.js', () => mockDeviceService);

// 3. Import Controller
const deviceController = await import('../../src/controllers/deviceController.js');

describe('DeviceController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('getDevices: should return 200', async () => {
    req.params.roomId = 'r1';
    mockDeviceService.getDevicesByRoomId.mockResolvedValue([]);
    
    await deviceController.getDevices(req, res, next);
    
    expect(mockDeviceService.getDevicesByRoomId).toHaveBeenCalledWith('r1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getDevice: should return 200', async () => {
    req.params.deviceId = 'd1';
    mockDeviceService.getDeviceById.mockResolvedValue({});
    
    await deviceController.getDevice(req, res, next);
    
    expect(mockDeviceService.getDeviceById).toHaveBeenCalledWith('d1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('addDeviceToRoom: should return 201', async () => {
    req.params.roomId = 'r1';
    req.body = { name: 'Lamp', type: 'light' };
    mockDeviceService.addDevice.mockResolvedValue({ _id: 'd1' });

    await deviceController.addDeviceToRoom(req, res, next);

    expect(mockDeviceService.addDevice).toHaveBeenCalledWith('r1', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('updateDeviceDetails: should return 200', async () => {
    req.params.deviceId = 'd1';
    req.body = { name: 'New Name' };
    mockDeviceService.updateDevice.mockResolvedValue({});

    await deviceController.updateDeviceDetails(req, res, next);

    expect(mockDeviceService.updateDevice).toHaveBeenCalledWith('d1', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('removeDevice: should return 200', async () => {
    req.params.deviceId = 'd1';
    mockDeviceService.removeDevice.mockResolvedValue({});

    await deviceController.removeDevice(req, res, next);

    expect(mockDeviceService.removeDevice).toHaveBeenCalledWith('d1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});