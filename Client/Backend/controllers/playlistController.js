const Playlist = require('../models/playlist');
const Track = require('../models/track');

// Function to create a playlist
exports.createPlaylist = async (req, res) => {
    const { name, text } = req.body; // Assuming 'text' is part of the request body
    const owner = req.user.id;

    if (!name) {
        return res.status(400).json({ error: 'Playlist name is required' });
    }

    const newPlaylist = new Playlist({ name, owner });

    try {
        await newPlaylist.save();
        res.status(201).json(newPlaylist);
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(400).json({ error: 'Failed to create playlist', details: error.message });
    }
};

// Function to get all playlists
exports.getPlaylists = async (req, res) => {
    try {
        const userId = req.user.id;
        const playlists = await Playlist.find({ owner: userId }).populate('owner');
        res.status(200).json(playlists);
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
};

// Function to get a specific playlist
exports.getPlaylist = async (req, res) => {
    const { id } = req.params;

    try {
        const playlist = await Playlist.findById(id).populate('owner');
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.status(200).json(playlist);
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ error: 'Error fetching playlist' });
    }
};

// Function to update a playlist
exports.updatePlaylist = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Playlist name is required' });
    }

    try {
        const updatedPlaylist = await Playlist.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedPlaylist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).json({ error: 'Error updating playlist' });
    }
};

// Function to delete a playlist
exports.deletePlaylist = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedPlaylist = await Playlist.findByIdAndDelete(id);
        if (!deletedPlaylist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).json({ error: 'Error deleting playlist' });
    }
};

// Function to add a track to a playlist
exports.addTrackToPlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const { trackId, title, thumbnail } = req.body;

    if (!trackId || !title || !thumbnail) {
        return res.status(400).json({ error: 'Track ID, title, and thumbnail are required' });
    }

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        const newTrack = { trackId, title, thumbnail };
        playlist.tracks.push(newTrack);
        await playlist.save();

        res.status(201).json(newTrack);
    } catch (error) {
        console.error('Error adding track to playlist:', error);
        res.status(500).json({ error: 'Failed to add track to playlist' });
    }
};

// Function to remove a track from a playlist
exports.removeTrackFromPlaylist = async (req, res) => {
    const { playlistId, trackId } = req.params;

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        playlist.tracks = playlist.tracks.filter(track => track.trackId !== trackId);
        await playlist.save();

        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting track from playlist:', error);
        res.status(500).json({ error: 'Failed to delete track from playlist' });
    }
};
