const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { verifyToken } = require('../middleware/auth');

// Create a new playlist
router.post('/', verifyToken, playlistController.createPlaylist);

// Get all playlists
router.get('/', verifyToken, playlistController.getPlaylists);

// Get a single playlist by ID
router.get('/:id', verifyToken, playlistController.getPlaylist);

// Update a playlist by ID
router.put('/:id', verifyToken, playlistController.updatePlaylist);

// Delete a playlist by ID
router.delete('/:id', verifyToken, playlistController.deletePlaylist);

// Add track to a specific playlist
router.post('/:playlistId/tracks', verifyToken, playlistController.addTrackToPlaylist);

// Remove track from a specific playlist
router.delete('/:playlistId/tracks/:trackId', verifyToken, playlistController.removeTrackFromPlaylist);

module.exports = router;
