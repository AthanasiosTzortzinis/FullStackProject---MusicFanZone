const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotifyService');

router.get('/login', (req, res) => {
  const scopes = 'user-read-private user-read-email'; 
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=code`;
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  
  if (code) {
    try {
      const { accessToken, refreshToken } = await spotifyService.handleCallback(code);
      res.redirect(`http://localhost:3000?accessToken=${accessToken}`); 
    } catch (error) {
      console.error('Error fetching access token:', error);
      res.status(500).json({ error: 'Error fetching access token' });
    }
  } else {
    console.error('Authorization code not provided');
    res.status(400).json({ error: 'Authorization code not provided' });
  }
});

module.exports = router;
