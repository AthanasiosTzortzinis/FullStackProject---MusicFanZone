const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, playlistController.createPlaylist);

router.get('/', verifyToken, playlistController.getPlaylists);

router.get('/:id', verifyToken, playlistController.getPlaylist);

router.put('/:id', verifyToken, playlistController.updatePlaylist);

router.delete('/:id', verifyToken, playlistController.deletePlaylist);

router.post('/:playlistId/tracks', verifyToken, playlistController.addTrackToPlaylist);

router.delete('/:playlistId/tracks/:trackId', verifyToken, playlistController.removeTrackFromPlaylist);

module.exports = router;
