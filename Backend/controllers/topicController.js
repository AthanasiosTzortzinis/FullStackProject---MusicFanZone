const Topic = require('../models/Topic'); // Ensure this path is correct
const mongoose = require('mongoose');

// Create a new topic
exports.createTopic = async (req, res) => {
    const { title, description } = req.body;

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    try {
        const newTopic = new Topic({ title, description });
        const savedTopic = await newTopic.save(); // Save the topic to the database
        res.status(201).json(savedTopic); // Respond with the created topic
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all topics
exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find(); // Fetch all topics from the database
        res.status(200).json(topics); // Respond with the list of topics
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a specific topic by ID
exports.getTopicById = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid topic ID.' });
    }

    try {
        const topic = await Topic.findById(id);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.status(200).json(topic); // Respond with the requested topic
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a specific topic
exports.updateTopic = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    // Validate input
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid topic ID.' });
    }

    try {
        const updatedTopic = await Topic.findByIdAndUpdate(
            id,
            { title, description },
            { new: true, runValidators: true } // Ensure validators are applied on updates
        );

        if (!updatedTopic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.status(200).json(updatedTopic); // Respond with the updated topic
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a specific topic
exports.deleteTopic = async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid topic ID.' });
    }

    try {
        const deletedTopic = await Topic.findByIdAndDelete(id);
        if (!deletedTopic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.status(200).json({ message: 'Topic deleted successfully' }); // Confirm deletion
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
