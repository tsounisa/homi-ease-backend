import { jest } from '@jest/globals';

// 1. Define Mocks
const mockRoomService = {
  getRoomsInHouse: jest.fn(),
  getRoomById: jest.fn(),
  addRoomToHouse: jest.fn(),
  updateRoom: jest.fn(),
  removeRoom: jest.fn(),
};

// 2. Register Mock
jest.unstable_mockModule('../../src/services/roomService.js', () => mockRoomService);

// 3. Import Controller
const roomController = await import('../../src/controllers/roomController.js');

describe('RoomController', () => {
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

  it('getRooms: should return 200 with rooms', async () => {
    req.params.houseId = 'h1';
    const rooms = [{ name: 'Kitchen' }];
    mockRoomService.getRoomsInHouse.mockResolvedValue(rooms);

    await roomController.getRooms(req, res, next);

    expect(mockRoomService.getRoomsInHouse).toHaveBeenCalledWith('h1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: rooms }));
  });

  it('getRoom: should return 200 with specific room', async () => {
    req.params.roomId = 'r1';
    const room = { name: 'Kitchen' };
    mockRoomService.getRoomById.mockResolvedValue(room);

    await roomController.getRoom(req, res, next);

    expect(mockRoomService.getRoomById).toHaveBeenCalledWith('r1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: room }));
  });

  it('addRoomToHouse: should return 201 with created room', async () => {
    req.params.houseId = 'h1';
    req.body = { name: 'New Room' };
    const created = { _id: 'r1', ...req.body };
    
    mockRoomService.addRoomToHouse.mockResolvedValue(created);

    await roomController.addRoomToHouse(req, res, next);

    // Note: Controller extracts { name } specifically in your implementation
    expect(mockRoomService.addRoomToHouse).toHaveBeenCalledWith('h1', { name: 'New Room' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: created }));
  });

  it('updateRoomDetails: should return 200 with updated room', async () => {
    req.params.roomId = 'r1';
    req.body = { name: 'Updated' };
    mockRoomService.updateRoom.mockResolvedValue(req.body);

    await roomController.updateRoomDetails(req, res, next);

    expect(mockRoomService.updateRoom).toHaveBeenCalledWith('r1', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('removeRoom: should return 200 with deletion status', async () => {
    req.params.roomId = 'r1';
    const result = { status: 'removed' };
    mockRoomService.removeRoom.mockResolvedValue(result);

    await roomController.removeRoom(req, res, next);

    expect(mockRoomService.removeRoom).toHaveBeenCalledWith('r1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should pass errors to next()', async () => {
    const error = new Error('Service Error');
    mockRoomService.getRoomsInHouse.mockRejectedValue(error);
    
    await roomController.getRooms(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });
});