const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
    trackId: { type: String, required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
});

const PlaylistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    tracks: [TrackSchema], 
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
module.exports = Playlist;

