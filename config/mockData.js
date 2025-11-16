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
export let mockAvailableDevices = []; // New: Available devices for pairing

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
  mockAvailableDevices = []; // Reset available devices

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
    owner: 'user-1',
    rooms: ['room-1', 'room-2'],
    createdAt: new Date(),
  });

  // --- MOCK ROOMS ---
  mockRooms.push({
    _id: 'room-1',
    name: 'Living Room',
    house: 'house-1',
    devices: ['device-1', 'device-2'],
    settings: { temperature: 21, lighting: 80 },
  });
  mockRooms.push({
    _id: 'room-2',
    name: 'Bedroom',
    house: 'house-1',
    devices: ['device-3'],
    settings: { temperature: 19, lighting: 0 },
  });

  // --- MOCK DEVICES ---
  mockDevices.push({
    _id: 'device-1',
    name: 'Living Room Lamp',
    room: 'room-1',
    type: 'light',
    category: 'lighting',
    status: { isOn: true, brightness: 80 },
  });
  mockDevices.push({
    _id: 'device-2',
    name: 'Main Thermostat',
    room: 'room-1',
    type: 'thermostat',
    category: 'climate',
    status: { isOn: true, temperature: 21 },
  });
  mockDevices.push({
    _id: 'device-3',
    name: 'Bedroom Light',
    room: 'room-2',
    type: 'light',
    category: 'lighting',
    status: { isOn: false, brightness: 0 },
  });
  mockDevices.push({
    _id: 'device-4',
    name: 'Front Door Lock',
    room: 'room-1', // Assuming entryway is part of living room
    type: 'security',
    category: 'security',
    status: { isOn: true, isLocked: true },
  });

  // --- MOCK AVAILABLE DEVICES (for pairing) ---
  // These are devices that are "discoverable" but not yet assigned to a room
  mockAvailableDevices.push({
    _id: 'available-device-1',
    owner: 'user-1', // Associated with user-1
    name: 'Philips Hue White Smart',
    type: 'light',
    category: 'lighting',
    description: 'Smart white light bulb, E27, 800 lumen',
    status: { isOn: false, brightness: 0 }, // Initial status
  });
  mockAvailableDevices.push({
    _id: 'available-device-2',
    owner: 'user-1', // Associated with user-1
    name: 'Smart Plug Mini',
    type: 'outlet',
    category: 'power',
    description: 'Compact smart plug with energy monitoring',
    status: { isOn: false },
  });
  mockAvailableDevices.push({
    _id: 'available-device-3',
    owner: 'user-1', // Associated with user-1
    name: 'Motion Sensor',
    type: 'sensor',
    category: 'security',
    description: 'PIR motion sensor with Zigbee',
    status: { motionDetected: false },
  });
  // Example for another user (if we had one)
  // mockAvailableDevices.push({
  //   _id: 'available-device-4',
  //   owner: 'user-2',
  //   name: 'Xiaomi Mi Robot Vacuum',
  //   type: 'vacuum',
  //   category: 'cleaning',
  //   description: 'Robotic vacuum cleaner with mapping',
  //   status: { isCleaning: false, battery: 100 },
  // });


  // --- MOCK AUTOMATIONS ---
  mockAutomations.push({
    _id: 'auto-1',
    name: 'Evening Light Routine',
    owner: 'user-1',
    trigger: { type: 'Time', value: '7:00 PM Daily' },
    action: { deviceId: 'device-1', command: { isOn: true, brightness: 70 } },
  });

  // --- MOCK SCENARIOS ---
  mockScenarios.push({
    _id: 'scene-1',
    name: 'Morning Wake-Up',
    owner: 'user-1',
    actions: [
      { deviceId: 'device-3', command: { isOn: true, brightness: 50 } },
      { deviceId: 'device-2', command: { temperature: 22 } },
    ],
  });
};