const Comment = require('../models/Comment');
const Topic = require('../models/Topic');
const mongoose = require('mongoose');

exports.createComment = async (req, res) => {
    const { topicId } = req.params;
    const { username, content } = req.body;

    if (!username || !content) {
        return res.status(400).json({ error: 'Username and content are required' });
    }

    try {
        const newComment = new Comment({
            username,
            content,
            topicId,
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Error creating comment' });
    }
};


exports.getAllComments = async (req, res) => {
    const { topicId } = req.params;

    try {
        const comments = await Comment.find({ topicId });
        if (!comments.length) {
            return res.status(404).json({ error: 'No comments found for this topic' });
        }
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
};


exports.getCommentById = async (req, res) => {
    const { topicId, id } = req.params;

    try {
        const comment = await Comment.findOne({ _id: id, topicId });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Error fetching comment' });
    }
};


exports.updateComment = async (req, res) => {
    const { topicId, id } = req.params;
    const { content } = req.body;

    try {
        const comment = await Comment.findOne({ _id: id, topicId });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        
        if (comment.username !== req.body.username) {
            return res.status(403).json({ message: 'You do not have permission to edit this comment.' });
        }

        comment.content = content || comment.content;
        const updatedComment = await comment.save();

        res.status(200).json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Error updating comment' });
    }
};


exports.deleteComment = async (req, res) => {
    const { topicId, id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const comment = await Comment.findOne({ _id: id, topicId });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.username !== req.body.username) {
            return res.status(403).json({ message: 'You do not have permission to delete this comment.' });
        }

        await comment.remove();
        res.status(204).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Error deleting comment' });
    }
};
