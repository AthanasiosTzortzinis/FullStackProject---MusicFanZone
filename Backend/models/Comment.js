const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Topic', // Assuming you have a Topic model to reference
    },
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
