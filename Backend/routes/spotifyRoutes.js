const express = require('express');
const router = express.Router();
const spotifyService = require('../Services/spotifyService');

router.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (code) {
    try {
      const { accessToken, refreshToken } = await spotifyService.handleCallback(code);
     
      res.json({ accessToken, refreshToken }); 
    } catch (error) {
      res.status(500).json({ error: 'Error fetching access token' });
    }
  } else {
    res.status(400).json({ error: 'Authorization code not provided' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || ''; 
    const data = await spotifyService.searchTracks(query);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching data from Spotify' });
  }
});

module.exports = router;
