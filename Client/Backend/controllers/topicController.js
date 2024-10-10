const Topic = require('../models/Topic');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); 


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided.' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token.' });
        req.userId = decoded.id; 
        next();
    });
};


exports.createTopic = async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    try {
        const newTopic = new Topic({ title, description, createdBy: req.userId }); 
        const savedTopic = await newTopic.save();
        res.status(201).json(savedTopic);
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find().populate('comments'); 
        res.status(200).json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getTopicById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid topic ID.' });
    }

    try {
        const topic = await Topic.findById(id).populate('comments');
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.status(200).json(topic);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.updateTopic = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid topic ID.' });
    }

    try {
        const topic = await Topic.findById(id);

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (topic.createdBy.toString() !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to edit this topic.' });
        }

        topic.title = title;
        topic.description = description;
        const updatedTopic = await topic.save();

        res.status(200).json(updatedTopic);
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.deleteTopic = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid topic ID.' });
    }

    try {
        const topic = await Topic.findById(id);

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (topic.createdBy.toString() !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this topic.' });
        }

        await topic.remove();
        res.status(204).json({ message: 'Topic deleted successfully.' });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
