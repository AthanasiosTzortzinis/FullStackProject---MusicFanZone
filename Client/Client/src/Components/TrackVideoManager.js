import React, { useState } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import '../Style/TrackVideoManager.css';

const TrackVideoManager = ({ playlists, selectedPlaylist, setSelectedPlaylist, setPlaylists, token }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [playingTrackId, setPlayingTrackId] = useState(null); // Track currently being listened to
    const [error, setError] = useState(null); // State for error messages

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
            setError(null); // Clear error on successful search
        } catch (error) {
            console.error('Error searching tracks:', error);
            setError('Error fetching search results. Please try again.'); // Set error message
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
            setError('Error adding track to playlist. Please try again.'); // Set error message
        }
    };

    const handleDeleteTrackFromPlaylist = async (trackId) => {
        if (!selectedPlaylist) return;

        const confirmed = window.confirm('Are you sure you want to delete this track from the playlist?');

        if (confirmed) {
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
        }
    };

    const toggleListenTrack = (trackId) => {
        setPlayingTrackId((prevTrackId) => (prevTrackId === trackId ? null : trackId)); // Toggle track playback
    };

    return (
      <div className="TrackVideoManager">
          <h2>Search Tracks for Playlist</h2>
          {error && <p>{error}</p>} {/* Display error message */ }
          <select onChange={(e) => setSelectedPlaylist(e.target.value)} value={selectedPlaylist}>
              <option value="">Select a Playlist</option>
              {playlists.map((playlist) => (
                  <option key={playlist._id} value={playlist._id}>{playlist.name}</option>
              ))}
          </select>
  
          <div className="search-container"> {/* Added wrapper for search input and button */}
              <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!e.target.value) {
                          setSearchResults([]); // Clear results when the search bar is empty
                      }
                  }}
                  placeholder="Search for tracks..."
              />
              <button className="search-button" onClick={handleSearchTracks}>Search</button>
          </div>
  
          {!selectedPlaylist && (
              <p>Please select a playlist.</p>
          )}
  
          <ul>
              {searchResults.map((track) => (
                  <li key={track.id.videoId}>
                      <a
                          href={`https://www.youtube.com/watch?v=${track.id.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                      >
                          {track.snippet.title}
                      </a>
                      <button className="add-to-playlist-button" onClick={() => handleAddTrackToPlaylist(track)}>Add to Playlist</button>

                  </li>
              ))}
          </ul>
  
          {selectedPlaylist && (
              <div className="TracksInPlaylist">
                  <h2>Tracks in Playlist</h2>
                  <ul>
                      {playlists.find((p) => p._id === selectedPlaylist)?.tracks?.map((track) => (
                          <li key={track.trackId}>
                              <a href={`https://www.youtube.com/watch?v=${track.trackId}`} target="_blank" rel="noopener noreferrer">
                                  {track.title}
                              </a>
                              <button onClick={() => toggleListenTrack(track.trackId)}>
                                  {playingTrackId === track.trackId ? 'Hide' : 'Listen / View'}
                              </button>
                              <button onClick={() => handleDeleteTrackFromPlaylist(track.trackId)}>Delete</button>
                          </li>
                      ))}
                  </ul>
              </div>
          )}
  
          {/* Render ReactPlayer if a track is being played */}
          {playingTrackId && (
              <div style={{ marginTop: '20px', width: '100%', maxWidth: '800px' }}>
                  <ReactPlayer
                      url={`https://www.youtube.com/watch?v=${playingTrackId}`}
                      playing={true} // Automatically play the track
                      controls={true} // Show player controls
                      width="100%" // Full width
                      height="450px" // Set height for larger size
                      style={{ borderRadius: '8px' }} // Optional: add some border-radius for styling
                  />
              </div>
          )}
      </div>
  );
};

export default TrackVideoManager;
