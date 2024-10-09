const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
}, { timestamps: true }); 

module.exports = mongoose.model('Topic', topicSchema);
