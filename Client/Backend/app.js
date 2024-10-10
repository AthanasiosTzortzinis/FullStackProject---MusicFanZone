require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const jwt = require("jsonwebtoken")
const playlistRoutes = require('./routes/playlistRoutes');
const trackRoutes = require('./routes/trackRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const userRoutes = require('./routes/user');
//const topicRoutes = require('./routes/topicRoutes'); 
const Comment = require('./models/Comment');
const Topic = require('./models/Topic');


const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Welcome to the MusicFanZone');
});





const authenticateUser =async  (req, res, next) => {
    try{
    const token = req.headers.authorization?.split(' ')[1];
  

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }else{
          const payload = await jwt.verify(token, process.env.SECRET_KEY);
        req.user = payload; 
        next();
    }
      
    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'Invalid token' });
    }
};


app.use('/user', userRoutes);
app.use('/playlists', playlistRoutes);
app.use('/tracks', trackRoutes);
//app.use('/api/topics', topicRoutes);


const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

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
                videoCategoryId: '10',
                maxResults: 30,
                key: process.env.YOUTUBE_API_KEY,
            },
        });
        res.json(response.data.items);
    } catch (error) {
        console.error('Error searching YouTube:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error searching YouTube' });
    }
});

app.get('/youtube/video/:videoId', async (req, res) => {
    const { videoId } = req.params;

    try {
        const response = await axios.get(`${YOUTUBE_BASE_URL}/videos`, {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId,
                key: process.env.YOUTUBE_API_KEY,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching video details from YouTube:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error fetching video details from YouTube' });
    }
});

// Comments routes
app.post('/api/topics/:topicId/comments', authenticateUser,async (req, res) => {
    const { topicId } = req.params;
    const { username, content } = req.body;

    if (!username || !content) {
        return res.status(400).json({ error: 'Username and content are required' });
    }

    try {
        const newComment = new Comment({ topicId, username, content });
        await newComment.save();
        return res.status(201).json(newComment);
    } catch (error) {
        console.log(error)
        console.error('Error saving comment:', error);
        return res.status(500).json({ error: 'Error creating comment' });
    }
});

app.get('/api/topics/:topicId/comments', async (req, res) => {
    const { topicId } = req.params;

    try {
        const comments = await Comment.find({ topicId: topicId });
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

app.put('/api/topics/:topicId/comments/:commentId', async (req, res) => {
    const { topicId, commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        const updatedComment = await Comment.findOneAndUpdate(
            { _id: commentId, topicId: topicId },
            { content: content },
            { new: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({ error: 'Error updating comment' });
    }
});

app.delete('/api/topics/:topicId/comments/:commentId', async (req, res) => {
    const { topicId, commentId } = req.params;

    try {
        const deletedComment = await Comment.findOneAndDelete({ _id: commentId, topicId: topicId });

        if (!deletedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ error: 'Error deleting comment' });
    }
});


app.post('/api/topics', authenticateUser, async (req, res) => {
  
    const { title, description } = req.body;
    
    const createdBy = req.user.username;


    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        const newTopic = new Topic({ title, description,createdBy });
        await newTopic.save();
        return res.status(201).json(newTopic);
    } catch (error) {
        console.error('Error saving topic:', error);
        return res.status(500).json({ error: 'Error creating topic' });
    }
});

app.get('/api/topics', async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Error fetching topics' });
    }
});

app.put('/api/topics/:topicId', async (req, res) => {
    const { topicId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        const updatedTopic = await Topic.findByIdAndUpdate(topicId, { title, description }, { new: true });
        if (!updatedTopic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.json(updatedTopic);
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ error: 'Error updating topic' });
    }
});

app.delete('/api/topics/:topicId', async (req, res) => {
    const { topicId } = req.params;

    try {
        const deletedTopic = await Topic.findByIdAndDelete(topicId);
        if (!deletedTopic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting topic:', error);
        return res.status(500).json({ error: 'Error deleting topic' });
    }
});


app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
