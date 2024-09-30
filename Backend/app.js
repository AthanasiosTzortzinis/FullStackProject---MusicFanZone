require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('qs'); // Ensure you have this package installed
const playlistRoutes = require('./routes/playlistRoutes');
const trackRoutes = require('./routes/trackRoutes');
const spotifyRoutes = require('./routes/spotifyRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const path = require('path');
const userRoutes = require('./routes/user');

dotenv.config(); 

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const app = express();
const port = process.env.PORT || 4000; 

app.use(cors()); 
app.use(express.json()); 

app.use('/user', userRoutes); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the MusicFanZone');
});

// Use the routes
app.use('/comments', commentsRoutes);
app.use('/playlists', playlistRoutes);
app.use('/tracks', trackRoutes);
app.use('/spotify', spotifyRoutes); 

// Spotify callback route
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = response.data.access_token;
    // You can store the access token in session or send it back to the frontend
    res.json({ accessToken });
  } catch (error) {
    console.error("Error fetching access token:", error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching access token');
  }
});

// 404 error handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
