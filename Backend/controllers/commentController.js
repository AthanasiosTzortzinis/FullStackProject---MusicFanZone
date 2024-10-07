const Comment = require('../models/Comment'); 
const mongoose = require('mongoose');

exports.createComment = async (req, res) => {
    const { topicId } = req.params; 
    const { username, content } = req.body; 

    try {
        
        if (!username || !content) {
            return res.status(400).json({ error: 'Username and content are required' });
        }

        const newComment = new Comment({
            username,
            content,
            topicId 
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
    console.log('Topic ID:', topicId); 
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
    const { topicId } = req.params; 

    try {
        
        const comment = await Comment.findOne({ _id: req.params.id, topicId });
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
    const { topicId } = req.params; 
    const { content } = req.body; 

    try {
        
        const comment = await Comment.findOne({ _id: req.params.id, topicId });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
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
    const { topicId } = req.params; 
    const { id } = req.params; 

    try {
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        
        const comment = await Comment.findOneAndDelete({ _id: id, topicId });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json({ message: 'Comment deleted successfully' }); 
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Error deleting comment', details: error.message });
    }
};
