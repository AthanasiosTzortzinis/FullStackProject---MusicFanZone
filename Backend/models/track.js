const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  album: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  spotifyId: {
    type: String,  
    required: true
  }
});

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
