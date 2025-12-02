import { Router } from 'express';
import { 
  addHouse, 
  removeHouse, 
  getHouses, 
  getHouse,    // <-- ΝΕΟ: Import
  updateHouse  // <-- ΝΕΟ: Import
} from '../controllers/houseController.js';
import { addRoomToHouse, getRooms } from '../controllers/roomController.js'; 
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// All house routes are protected
router.use(protect);

// @route   GET /api/v1/houses
// @desc    Get all houses for the authenticated user
router.get('/', getHouses);

// @route   POST /api/v1/houses
// @desc    Add a house
router.post('/', validate(), addHouse);

// --- ΤΑ ΝΕΑ ROUTES ΠΟΥ ΕΛΕΙΠΑΝ ---

// @route   GET /api/v1/houses/:houseId
// @desc    Get specific house details
router.get('/:houseId', getHouse);

// @route   PUT /api/v1/houses/:houseId
// @desc    Update house details
router.put('/:houseId', validate(), updateHouse);

// ----------------------------------

// @route   DELETE /api/v1/houses/:houseId
// @desc    Remove a house
router.delete('/:houseId', removeHouse);

// @route   GET /api/v1/houses/:houseId/rooms
// @desc    Get all rooms for a specific house
router.get('/:houseId/rooms', getRooms); 

// @route   POST /api/v1/houses/:houseId/rooms
// @desc    Add a room to a house
router.post('/:houseId/rooms', validate(), addRoomToHouse);

export default router;