import { Router } from 'express';
import { addHouse, removeHouse, getHouses } from '../controllers/houseController.js';
import { addRoomToHouse, getRooms } from '../controllers/roomController.js'; // Import getRooms
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// All house routes are protected
router.use(protect);

// @route   GET /api/v1/houses
// @desc    Get all houses for the authenticated user
// @access  Private
router.get('/', getHouses);

// @route   POST /api/v1/houses
// @desc    Add a house
// @access  Private
router.post('/', validate(), addHouse);

// @route   DELETE /api/v1/houses/:houseId
// @desc    Remove a house
// @access  Private
router.delete('/:houseId', removeHouse);

// @route   GET /api/v1/houses/:houseId/rooms
// @desc    Get all rooms for a specific house
// @access  Private
router.get('/:houseId/rooms', getRooms); // Add this GET route

// @route   POST /api/v1/houses/:houseId/rooms
// @desc    Add a room to a house
// @access  Private
// This nested route is logically placed here
router.post('/:houseId/rooms', validate(), addRoomToHouse);

export default router;