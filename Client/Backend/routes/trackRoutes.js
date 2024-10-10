const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');

router.post('/', trackController.createTrack); // Create a new track
router.get('/', trackController.getTracks); // Get all tracks
router.get('/:id', trackController.getTrack); // Get a single track by ID
router.put('/:id', trackController.updateTrack); // Update a track by ID
router.delete('/:id', trackController.deleteTrack); // Delete a track by ID

module.exports = router;
