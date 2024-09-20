const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
});

module.exports = mongoose.model('Playlist', playlistSchema);

