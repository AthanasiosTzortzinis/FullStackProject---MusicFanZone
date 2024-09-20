const Track = require('../models/track');

exports.createTrack = async (req, res) => {
  try {
    const track = new Track(req.body);
    await track.save();
    res.status(201).json(track);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getTracks = async (req, res) => {
  try {
    const tracks = await Track.find();
    res.status(200).json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.status(200).json(track);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    res.status(200).json({
      message: 'Track updated successfully',
      updatedTrack: track
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.status(200).json({ message: 'Track deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
