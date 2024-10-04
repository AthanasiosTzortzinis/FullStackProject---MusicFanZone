require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const playlistRoutes = require('./routes/playlistRoutes');
const trackRoutes = require('./routes/trackRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const userRoutes = require('./routes/user');

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

// YouTube API Base URL
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Route to search for tracks in YouTube
app.get('/youtube/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const response = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: 20, // Specify the number of results
        key: process.env.YOUTUBE_API_KEY, // Use the API key from .env
      },
    });
    res.json(response.data.items);
  } catch (error) {
    console.error('Error searching YouTube:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error searching YouTube' });
  }
});

// Route to get video details by video ID
app.get('/youtube/video/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const response = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY, // Use the API key from .env
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching video details from YouTube:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching video details from YouTube' });
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
