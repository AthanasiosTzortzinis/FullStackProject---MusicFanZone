const Comment = require('../models/Comment'); // Importing the Comment model
const mongoose = require('mongoose');

// Create a new comment for a specific topic
exports.createComment = async (req, res) => {
    const { topicId } = req.params; // Extracting topicId from the request parameters
    const { username, content } = req.body; // Extracting username and content from the request body

    try {
        // Validate input
        if (!username || !content) {
            return res.status(400).json({ error: 'Username and content are required' });
        }

        // Create a new comment instance
        const newComment = new Comment({
            username,
            content,
            topicId // Associate the comment with the topic ID
        });

        // Save the new comment to the database
        const savedComment = await newComment.save();
        res.status(201).json(savedComment); // Return the created comment
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Error creating comment' });
    }
};

// Get all comments for a specific topic
exports.getAllComments = async (req, res) => {
    const { topicId } = req.params; // Extracting topicId from the request parameters

    try {
        // Find all comments associated with the topicId
        const comments = await Comment.find({ topicId });
        res.status(200).json(comments); // Return the comments
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
};

// Get a specific comment by its ID
exports.getCommentById = async (req, res) => {
    const { topicId } = req.params; // Extracting topicId from the request parameters

    try {
        // Find the comment by its ID and ensure it belongs to the topic
        const comment = await Comment.findOne({ _id: req.params.id, topicId });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(comment); // Return the found comment
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Error fetching comment' });
    }
};

// Update a specific comment by its ID
exports.updateComment = async (req, res) => {
    const { topicId } = req.params; // Extracting topicId from the request parameters
    const { content } = req.body; // Extracting content from the request body

    try {
        // Find the comment by its ID and ensure it belongs to the topic
        const comment = await Comment.findOne({ _id: req.params.id, topicId });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Update the comment content
        comment.content = content || comment.content;
        const updatedComment = await comment.save(); // Save the updated comment

        res.status(200).json(updatedComment); // Return the updated comment
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Error updating comment' });
    }
};

// Delete a specific comment by its ID
exports.deleteComment = async (req, res) => {
    const { topicId } = req.params; // Extracting topicId from the request parameters

    try {
        const { id } = req.params; // Extracting comment ID from the request parameters

        // Validate comment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        // Find and delete the comment ensuring it belongs to the topic
        const comment = await Comment.findOneAndDelete({ _id: id, topicId });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json({ message: 'Comment deleted successfully' }); // Confirm deletion
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Error deleting comment', details: error.message });
    }
};
