// Playlists.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackVideoManager from './TrackVideoManager'; // Import the TrackVideoManager

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState(null);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [editingPlaylistName, setEditingPlaylistName] = useState('');

  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000',
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axiosInstance.get('/playlists');
        setPlaylists(response.data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError('Could not fetch playlists. Please try again.');
      }
    };

    fetchPlaylists();
  }, [axiosInstance]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName) return;

    try {
      const response = await axiosInstance.post('/playlists', {
        name: newPlaylistName,
      });
      setPlaylists([...playlists, { ...response.data, tracks: [] }]);
      setNewPlaylistName('');
    } catch (error) {
      console.error('Error creating playlist:', error);
      setError('Failed to create playlist.');
    }
  };

  const startEditingPlaylist = (playlist) => {
    setEditingPlaylistId(playlist._id);
    setEditingPlaylistName(playlist.name);
  };

  const handleEditPlaylist = async () => {
    if (!editingPlaylistName) return;

    try {
      const response = await axiosInstance.put(`/playlists/${editingPlaylistId}`, {
        name: editingPlaylistName,
      });

      const updatedPlaylists = playlists.map((playlist) => {
        if (playlist._id === editingPlaylistId) {
          return { ...playlist, name: response.data.name };
        }
        return playlist;
      });

      setPlaylists(updatedPlaylists);
      setEditingPlaylistId(null);
      setEditingPlaylistName('');
    } catch (error) {
      console.error('Error updating playlist name:', error);
      setError('Failed to update playlist name.');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await axiosInstance.delete(`/playlists/${playlistId}`);
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
      setSelectedPlaylist('');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setError('Failed to delete playlist.');
    }
  };

  return (
    <div>
      <h1>Manage Your Playlists</h1>

      <input
        type="text"
        value={newPlaylistName}
        onChange={(e) => setNewPlaylistName(e.target.value)}
        placeholder="New Playlist Name"
      />
      <button onClick={handleCreatePlaylist}>Create Playlist</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Your Playlists</h2>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist._id}>
            {editingPlaylistId === playlist._id ? (
              <>
                <input 
                  type="text" 
                  value={editingPlaylistName} 
                  onChange={(e) => setEditingPlaylistName(e.target.value)}
                />
                <button onClick={handleEditPlaylist}>Save</button>
              </>
            ) : (
              <>
                <span onClick={() => setSelectedPlaylist(playlist._id)}>{playlist.name}</span>
                <button onClick={() => startEditingPlaylist(playlist)}>Edit</button>
                <button onClick={() => handleDeletePlaylist(playlist._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <TrackVideoManager playlists={playlists} selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} setPlaylists={setPlaylists} token={token} />
    </div>
  );
};

export default Playlists;
