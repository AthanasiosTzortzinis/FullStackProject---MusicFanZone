require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

// Import routes
const playlistRoutes = require('./routes/playlistRoutes');
const trackRoutes = require('./routes/trackRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const userRoutes = require('./routes/user');
const topicRoutes = require('./routes/topicRoutes');
const Comment = require('./models/Comment'); // Import the Comment model

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the MusicFanZone');
});

// Use the routes
app.use('/user', userRoutes);
app.use('/playlists', playlistRoutes);
app.use('/tracks', trackRoutes);
app.use('/api/topics', topicRoutes); // Topic routes


// Comment routes with dynamic topicID
app.post('/api/topics/:topicId/comments', async (req, res) => {
    const { topicId } = req.params;
    const { username, content } = req.body;

    // Validation checks
    if (!username || !content) {
        return res.status(400).json({ error: 'Username and content are required' });
    }

    try {
        const newComment = new Comment({
            topicId,
            username,
            content,
        });
        await newComment.save();

        return res.status(201).json(newComment); // Return the saved comment
    } catch (error) {
        console.error('Error saving comment:', error);
        return res.status(500).json({ error: 'Error creating comment' });
    }
});

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

        // Send the YouTube search results
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

        // Send the video details
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching video details from YouTube:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error fetching video details from YouTube' });
    }
});

app.get('/api/topics/:topicId/comments', async (req, res) => {
  const { topicId } = req.params;

  try {
      const comments = await Comment.find({ topicId: topicId }); // Find comments by topicId

      res.status(200).json(comments); // Return the comments as a response
  } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Error fetching comments' });
  }
});

app.put('/api/topics/:topicId/comments/:commentId', async (req, res) => {
  const { topicId, commentId } = req.params;
  const { content } = req.body;

  // Validation checks
  if (!content) {
      return res.status(400).json({ error: 'Content is required' });
  }

  try {
      const updatedComment = await Comment.findOneAndUpdate(
          { _id: commentId, topicId: topicId }, // Ensure the comment belongs to the correct topic
          { content: content },
          { new: true } // Return the updated document
      );

      if (!updatedComment) {
          return res.status(404).json({ error: 'Comment not found' });
      }

      res.status(200).json(updatedComment); // Return the updated comment
  } catch (error) {
      console.error('Error updating comment:', error);
      return res.status(500).json({ error: 'Error updating comment' });
  }
});

// Route to delete a comment
app.delete('/api/topics/:topicId/comments/:commentId', async (req, res) => {
  const { topicId, commentId } = req.params;

  try {
      const deletedComment = await Comment.findOneAndDelete({ _id: commentId, topicId: topicId }); // Ensure comment belongs to topic

      if (!deletedComment) {
          return res.status(404).json({ error: 'Comment not found' });
      }

      res.status(204).send(); // No content response for successful deletion
  } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Error deleting comment' });
  }
});

// 404 Error Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// General error handler for catching internal server errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
