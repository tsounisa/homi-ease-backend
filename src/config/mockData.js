import bcrypt from 'bcryptjs';

/**
 * In-memory storage for mock data.
 * These are exported so services can mutate them.
 */
export let mockUsers = [];
export let mockHouses = [];
export let mockRooms = [];
export let mockDevices = [];
export let mockAutomations = [];
export let mockScenarios = [];
export let mockAvailableDevices = [];

/**
 * @function loadMockData
 * @description Populates the in-memory arrays with initial data.
 * Hashes passwords for mock users.
 */
export const loadMockData = async () => {
  // Reset arrays
  mockUsers = [];
  mockHouses = [];
  mockRooms = [];
  mockDevices = [];
  mockAutomations = [];
  mockScenarios = [];
  mockAvailableDevices = [];

  // --- MOCK USERS ---
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  mockUsers.push({
    _id: 'user-1',
    name: 'Demo User',
    email: 'user@example.com',
    password: hashedPassword,
    houses: ['house-1'],
    createdAt: new Date(),
  });

  // --- MOCK HOUSES ---
  mockHouses.push({
    _id: 'house-1',
    name: "Demo User's Home",
    userId: 'user-1',         
    rooms: ['room-1', 'room-2'],
    createdAt: new Date(),
  });

  // --- MOCK ROOMS ---
  mockRooms.push({
    _id: 'room-1',
    name: 'Living Room',
    houseId: 'house-1',       
    devices: ['device-1', 'device-2'],
    settings: { temperature: 21, lighting: 80 },
  });
  mockRooms.push({
    _id: 'room-2',
    name: 'Bedroom',
    houseId: 'house-1',       
    devices: ['device-3'],
    settings: { temperature: 19, lighting: 0 },
  });

  // --- MOCK DEVICES ---
  mockDevices.push({
    _id: 'device-1',
    name: 'Living Room Lamp',
    roomId: 'room-1',         
    type: 'light', // Was 'switch'
    status: { isOn: true, brightness: 100 }, // Was 'ON'
  });
  
  mockDevices.push({
    _id: 'device-2',
    name: 'Main Thermostat',
    roomId: 'room-1',
    type: 'thermostat',
    status: { temperature: 21, mode: 'heat' }, // Was '21°C'
  });
  
  mockDevices.push({
    _id: 'device-3',
    name: 'Bedroom Light',
    roomId: 'room-2',         
    type: 'light', // Was 'switch'
    status: { isOn: false, brightness: 0 }, // Was 'OFF'
  });

  // --- MOCK AVAILABLE DEVICES (for pairing) ---
  mockAvailableDevices.push({
    _id: 'available-device-1',
    userId: 'user-1', 
    name: 'Philips Hue White Smart',
    type: 'light', // Was 'switch'
    description: 'Smart white light bulb',
    status: { isOn: false }, 
  });
  
  mockAvailableDevices.push({
    _id: 'available-device-2',
    userId: 'user-1',
    name: 'Motion Sensor',
    type: 'security', // Was 'sensor'
    description: 'PIR motion sensor',
    status: { active: false }, 
  });

  // --- MOCK AUTOMATIONS ---
  mockAutomations.push({
    _id: 'auto-1',
    name: 'Evening Light Routine',
    userId: 'user-1',
    trigger: { type: 'Time', value: '7:00 PM Daily' },
    action: { deviceId: 'device-1', command: { isOn: true } },
  });

  // --- MOCK SCENARIOS ---
  mockScenarios.push({
    _id: 'scene-1',
    name: 'Morning Wake-Up',
    userId: 'user-1',
    actions: [
      { deviceId: 'device-3', command: { isOn: true } },
      { deviceId: 'device-2', command: { temperature: 22 } },
    ],
  });
};