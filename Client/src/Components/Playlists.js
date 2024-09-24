import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [editPlaylistId, setEditPlaylistId] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [trackName, setTrackName] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  const API_URL = 'http://localhost:4000'; 

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(`${API_URL}/playlists`);
        setPlaylists(response.data);
      } catch (error) {
        console.error("Error fetching playlists:", error.response ? error.response.data : error.message);
      }
    };
    fetchPlaylists();
  }, []);

  const addPlaylist = async (e) => {
    e.preventDefault();
    if (playlistName.trim() !== '') {
      try {
        const newPlaylist = { name: playlistName, tracks: [] };
        const response = await axios.post(`${API_URL}/playlists`, newPlaylist);
        setPlaylists([...playlists, response.data]);
        setPlaylistName('');
      } catch (error) {
        console.error("Error adding playlist:", error.response ? error.response.data : error.message);
      }
    }
  };


  const deletePlaylist = async (id) => {
    try {
      await axios.delete(`${API_URL}/playlists/${id}`);
      setPlaylists(playlists.filter(playlist => playlist._id !== id)); 
    } catch (error) {
      console.error("Error deleting playlist:", error.response ? error.response.data : error.message);
    }
  };

  
  const startEditPlaylist = (id, name) => {
    setEditPlaylistId(id);
    setEditPlaylistName(name);
  };

  
  const editPlaylist = async (e) => {
    e.preventDefault();
    try {
      const updatedPlaylist = { name: editPlaylistName };
      await axios.put(`${API_URL}/playlists/${editPlaylistId}`, updatedPlaylist);
      setPlaylists(playlists.map(playlist =>
        playlist._id === editPlaylistId ? { ...playlist, name: editPlaylistName } : playlist
      ));
      setEditPlaylistId(null);
      setEditPlaylistName('');
    } catch (error) {
      console.error("Error editing playlist:", error.response ? error.response.data : error.message);
    }
  };

  
  const addTrackToPlaylist = async () => {
    if (trackName.trim() !== '' && selectedPlaylistId) {
      try {
        const updatedTrack = { name: trackName }; 
        await axios.post(`${API_URL}/playlists/${selectedPlaylistId}/tracks`, updatedTrack);
        
        
        setPlaylists(playlists.map(playlist => {
          if (playlist._id === selectedPlaylistId) {
            return { ...playlist, tracks: [...playlist.tracks, trackName] };
          }
          return playlist;
        }));
        setTrackName('');
      } catch (error) {
        console.error("Error adding track:", error.response ? error.response.data : error.message);
      }
    }
  };

  return (
    <div>
      {/* Add Playlist */}
      <h3>Add a New Playlist</h3>
      <form onSubmit={addPlaylist}>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          placeholder="Playlist Name"
          required
        />
        <button type="submit">Add Playlist</button>
      </form>

      {/* List all playlists */}
      <h2>Playlists</h2>
      <ul>
        {playlists.map(playlist => (
          <li key={playlist._id}>
            {editPlaylistId === playlist._id ? (
              <form onSubmit={editPlaylist}>
                <input
                  type="text"
                  value={editPlaylistName}
                  onChange={(e) => setEditPlaylistName(e.target.value)}
                  required
                />
                <button type="submit">Update</button>
                <button type="button" onClick={() => setEditPlaylistId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                {playlist.name}
                <button onClick={() => deletePlaylist(playlist._id)}>Delete</button>
                <button onClick={() => startEditPlaylist(playlist._id, playlist.name)}>Edit</button>
              </>
            )}
            {/* List of Tracks */}
            {playlist.tracks.length > 0 && (
              <ul>
                {playlist.tracks.map((track, index) => (
                  <li key={index}>{track}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Add/Edit/Delete Tracks Section */}
      {playlists.length > 0 && (
        <div>
          <h3>Manage Tracks</h3>
          <select onChange={(e) => setSelectedPlaylistId(e.target.value)} value={selectedPlaylistId}>
            <option value="" disabled>Select a Playlist</option>
            {playlists.map(playlist => (
              <option key={playlist._id} value={playlist._id}>{playlist.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            placeholder="Track Name"
          />
          <button onClick={addTrackToPlaylist}>Add Track</button>
        </div>
      )}
    </div>
  );
}

export default Playlists;
