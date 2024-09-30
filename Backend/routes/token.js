const express = require('express');
const router = express.Router();
const {getSpotifyAccessToken} = require ('../Services/spotifyService');


//const tokenController = require('../controllers/token');

//router.get('/get-token', tokenController.getToken);
router.get('/get-token',getSpotifyAccessToken);

module.exports = router;
