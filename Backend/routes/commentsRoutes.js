const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Nested under '/api/topics/:topicId/comments'
router.post('/', commentController.createComment); // Add a comment to a topic
router.get('/', commentController.getAllComments); // Fetch all comments for a topic
router.get('/:id', commentController.getCommentById); // Fetch a specific comment by its ID
router.put('/:id', commentController.updateComment); // Update a specific comment
router.delete('/:id', commentController.deleteComment); // Delete a specific comment

module.exports = router;
