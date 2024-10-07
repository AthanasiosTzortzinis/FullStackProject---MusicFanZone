const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true, // Removes trailing/leading whitespaces
    },
    content: {
        type: String,
        required: true,
        trim: true, // Removes trailing/leading whitespaces
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Topic', // Reference to the Topic model
    },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
