const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Define routes relative to the parent route (which includes topicId)
router.post('/', commentController.createComment); // For adding a comment to a specific topic
router.get('/', commentController.getAllComments); // Fetch all comments for the specific topic
router.get('/:id', commentController.getCommentById); // Fetch a specific comment by its ID
router.put('/:id', commentController.updateComment); // Update a specific comment
router.delete('/:id', commentController.deleteComment); // Delete a specific comment

module.exports = router;
