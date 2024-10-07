const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController'); // Ensure this path is correct

// Define routes for topic management
router.post('/', topicController.createTopic);   // Create a new topic
router.get('/', topicController.getAllTopics);    // Get all topics
router.get('/:id', topicController.getTopicById); // Get a specific topic by ID
router.put('/:id', topicController.updateTopic);   // Update a specific topic
router.delete('/:id', topicController.deleteTopic); // Delete a specific topic

module.exports = router;
