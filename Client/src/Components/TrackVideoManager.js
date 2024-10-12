import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';
import '../Style/TrackVideoManager.css';

const TrackVideoManager = ({ playlists, selectedPlaylist, setSelectedPlaylist, setPlaylists, token }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [playingTrackIndex, setPlayingTrackIndex] = useState(null);
    const [error, setError] = useState(null); 
    const [trackAddedMessage, setTrackAddedMessage] = useState(''); // <-- Add state for the "Track added" message
    const playerRef = useRef(null); 

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

            // Display the "Track added" message
            setTrackAddedMessage('Track added!'); // <-- Set the message when the track is added

            // Hide the message after 3 seconds
            setTimeout(() => {
                setTrackAddedMessage('');
            }, 3000);
        
        } catch (error) {
            console.error('Error adding track to playlist:', error);
            setError('Error adding track to playlist. Please try again.'); 
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

    const toggleListenTrack = (index) => {
        setPlayingTrackIndex((prevIndex) => (prevIndex === index ? null : index)); 
    };

    const handleVideoEnd = () => {
       
        const nextTrackIndex = playingTrackIndex + 1;
        const playlistTracks = playlists.find((p) => p._id === selectedPlaylist)?.tracks;

        if (playlistTracks && nextTrackIndex < playlistTracks.length) {
            setPlayingTrackIndex(nextTrackIndex);
        } else {
            setPlayingTrackIndex(null); 
        }
    };

    useEffect(() => {
        if (playingTrackIndex !== null) {
           
            playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [playingTrackIndex]); 

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
                          setSearchResults([]); 
                      }
                  }}
                  placeholder="Search for tracks..."
              />
              <button className="search-button" onClick={handleSearchTracks}>Search</button>
          </div>

          {/* Display the track added message if it's not an empty string */}
          {trackAddedMessage && <p className="track-added-message">{trackAddedMessage}</p>}
  
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
                      {playlists.find((p) => p._id === selectedPlaylist)?.tracks?.map((track, index) => (
                          <li key={track.trackId}>
                              <a href={`https://www.youtube.com/watch?v=${track.trackId}`} target="_blank" rel="noopener noreferrer">
                                  {track.title}
                              </a>
                              <button onClick={() => toggleListenTrack(index)}>
                                  {playingTrackIndex === index ? 'Hide' : 'Listen / View'}
                              </button>
                              <button onClick={() => handleDeleteTrackFromPlaylist(track.trackId)}>Delete</button>
                          </li>
                      ))}
                  </ul>
              </div>
          )}
  
          {/* Render ReactPlayer if a track is being played */}
          {playingTrackIndex !== null && selectedPlaylist && (
              <div ref={playerRef} style={{ marginTop: '20px', width: '100%', maxWidth: '800px' }}>
                  <ReactPlayer
                      url={`https://www.youtube.com/watch?v=${playlists.find((p) => p._id === selectedPlaylist)?.tracks[playingTrackIndex].trackId}`}
                      playing={true} 
                      controls={true} 
                      width="100%" 
                      height="450px" 
                      style={{ borderRadius: '8px' }} 
                      onEnded={handleVideoEnd} 
                  />
              </div>
          )}
      </div>
  );
};

export default TrackVideoManager;
