const express = require('express');
const Topic = require('../models/Topic'); 
const jwt = require('jsonwebtoken');
const router = express.Router();





router.post('/', authenticateUser, async (req, res) => {
    const { title, description } = req.body;
    const { username } = req.user;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        const newTopic = new Topic({ title, description, createdBy: username });
        const savedTopic = await newTopic.save();
        return res.status(201).json(savedTopic); 
    } catch (error) {
        console.error('Error saving topic:', error);
        return res.status(500).json({ error: 'Error saving topic', details: error.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Error fetching topics' });
    }
});


router.put('/:topicId', authenticateUser, async (req, res) => {
    const { topicId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    try {
        const updatedTopic = await Topic.findOneAndUpdate(
            { _id: topicId, createdBy: req.user.username }, 
            { title, description },
            { new: true }
        );

        if (!updatedTopic) {
            return res.status(404).json({ error: 'Topic not found or not authorized' });
        }

        res.status(200).json(updatedTopic);
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ error: 'Error updating topic' });
    }
});


router.delete('/:topicId', authenticateUser, async (req, res) => {
 
    const { topicId } = req.params;
    console.log("topicId",topicId)

    try {
        const deletedTopic = await Topic.findOneAndDelete({ _id: topicId, createdBy: req.user.username }); 

        if (!deletedTopic) {
            return res.status(404).json({ error: 'Topic not found or not authorized' });
        }

        res.status(204).send(); 
    } catch (error) {
        console.error('Error deleting topic:', error);
        return res.status(500).json({ error: 'Error deleting topic' });
    }
});

module.exports = router;
