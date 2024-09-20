const Playlist = require('../models/playlist');

exports.createPlaylist = async (req, res) => {
  try {
    const playlist = new Playlist(req.body);
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find().populate('tracks');
    res.status(200).json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('tracks');
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.status(200).json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.status(200).json({ message: 'Playlist updated successfully', playlist });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    res.status(200).json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
