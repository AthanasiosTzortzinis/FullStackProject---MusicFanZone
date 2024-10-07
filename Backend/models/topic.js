const mongoose = require('mongoose');

// Define the schema for a forum topic
const topicSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
