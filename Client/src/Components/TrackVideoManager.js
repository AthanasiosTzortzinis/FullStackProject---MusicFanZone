// TrackVideoManager.js
import React, { useState } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';

const TrackVideoManager = ({ playlists, selectedPlaylist, setSelectedPlaylist, setPlaylists, token }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrackId, setPlayingTrackId] = useState(null); 
  const [error, setError] = useState(null); 

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000',
    headers: { Authorization: `Bearer ${token}` },
  });

  const handleSearchTracks = async () => {
    if (!searchQuery) return;
  
    try {
      const response = await axios.get(`http://localhost:4000/youtube/search?query=${searchQuery} music&type=video`, {
        
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setSearchResults(response.data);
      setError(null); 
    } catch (error) {
      console.error('Error searching tracks:', error);
      setError('Error fetching search results. Please try again.'); 
    }
  };

  const handleAddTrackToPlaylist = async (track) => {
    if (!selectedPlaylist) return;

    try {
      const response = await axiosInstance.post(`/playlists/${selectedPlaylist}/tracks`, {
        trackId: track.id.videoId,
        title: track.snippet.title,
        thumbnail: track.snippet.thumbnails.default.url,
      });

      const updatedPlaylists = playlists.map((playlist) => {
        if (playlist._id === selectedPlaylist) {
          return { ...playlist, tracks: [...playlist.tracks, response.data] };
        }
        return playlist;
      });
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      setError('Error adding track to playlist. Please try again.'); 
    }
  };

  const handleDeleteTrackFromPlaylist = async (trackId) => {
    if (!selectedPlaylist) return;

    try {
      await axiosInstance.delete(`/playlists/${selectedPlaylist}/tracks/${trackId}`);
      const updatedPlaylists = playlists.map((playlist) => {
        if (playlist._id === selectedPlaylist) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter((track) => track.trackId !== trackId),
          };
        }
        return playlist;
      });
      setPlaylists(updatedPlaylists);
    } catch (error) {
      console.error('Error deleting track from playlist:', error);
      setError('Error deleting track from playlist. Please try again.'); 
    }
  };

  const toggleListenTrack = (trackId) => {
    setPlayingTrackId((prevTrackId) => (prevTrackId === trackId ? null : trackId)); 
  };

  return (
    <div>
      <h2>Search Tracks for Playlist</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      <select onChange={(e) => setSelectedPlaylist(e.target.value)} value={selectedPlaylist}>
        <option value="">Select a Playlist</option>
        {playlists.map((playlist) => (
          <option key={playlist._id} value={playlist._id}>{playlist.name}</option>
        ))}
      </select>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          if (!e.target.value) {
            setSearchResults([]); 
          }
        }}
        placeholder="Search for tracks..."
      />
      <button onClick={handleSearchTracks}>Search</button>

      {!selectedPlaylist && (
    <p style={{ color: 'red' }}>Please select a playlist.</p>
       )}

      <ul>
        {searchResults.map((track) => (
          <li key={track.id.videoId}>
            <a
              href={`https://www.youtube.com/watch?v=${track.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'blue' }} 
            >
              {track.snippet.title}
            </a>
            <button style={{ marginLeft: '10px' }} onClick={() => handleAddTrackToPlaylist(track)}>Add to Playlist</button>
          </li>
        ))}
      </ul>

      {selectedPlaylist && (
        <div>
          <h2>Tracks in Playlist</h2>
          <ul>
            {playlists.find((p) => p._id === selectedPlaylist)?.tracks?.map((track) => (
              <li key={track.trackId}>
                <span>{track.title}</span>
                <button onClick={() => toggleListenTrack(track.trackId)}>
                  {playingTrackId === track.trackId ? 'Hide' : 'Listen'}
                </button>
                {playingTrackId === track.trackId && (
                  <ReactPlayer url={`https://www.youtube.com/watch?v=${track.trackId}`} playing controls />
                )}
                <button onClick={() => handleDeleteTrackFromPlaylist(track.trackId)}>Delete Track</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrackVideoManager;
