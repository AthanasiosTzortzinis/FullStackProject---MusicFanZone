const mongoose = require('mongoose');

// Define the Track schema
const TrackSchema = new mongoose.Schema({
    trackId: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
});

// Define the Playlist schema
const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
    tracks: [TrackSchema], // Make sure this is an array of TrackSchema
});

// Create the Playlist model
const Playlist = mongoose.model('Playlist', PlaylistSchema);
module.exports = Playlist;

