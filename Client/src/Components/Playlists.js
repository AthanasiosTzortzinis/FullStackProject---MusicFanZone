import React, { useState, useEffect } from "react";
import axios from "axios";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [editPlaylistId, setEditPlaylistId] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [trackName, setTrackName] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editTrackName, setEditTrackName] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const API_URL = "http://localhost:4000";
  const SPOTIFY_API_URL = "https://api.spotify.com/v1/search";

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        console.log("Fetching playlists...");
        const response = await axios.get(`${API_URL}/playlists`);
        setPlaylists(response.data);
        console.log("Playlists fetched:", response.data);
      } catch (error) {
        console.error(
          "Error fetching playlists:",
          error.response ? error.response.data : error.message
        );
      }
    };

    // Check if there's an access token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("accessToken");
    if (token) {
      console.log("Access token found in URL:", token); // Log the token found
      setAccessToken(token); // Store access token in state
      window.history.replaceState({}, document.title, window.location.pathname); // Remove token from URL
    } else {
      console.log("No access token found in URL.");
    }

    fetchPlaylists(); // Fetch playlists after setting access token
  }, []);

  const addPlaylist = async (e) => {
    e.preventDefault();
    if (playlistName.trim() !== "") {
      try {
        const newPlaylist = { name: playlistName, tracks: [] };
        const response = await axios.post(`${API_URL}/playlists`, newPlaylist);
        setPlaylists([...playlists, response.data]);
        setPlaylistName("");
        console.log("Playlist added:", response.data);
      } catch (error) {
        console.error(
          "Error adding playlist:",
          error.response ? error.response.data : error.message
        );
      }
    }
  };

  const deletePlaylist = async (id) => {
    try {
      await axios.delete(`${API_URL}/playlists/${id}`);
      setPlaylists(playlists.filter((playlist) => playlist._id !== id));
      console.log("Playlist deleted:", id);
    } catch (error) {
      console.error(
        "Error deleting playlist:",
        error.response ? error.response.data : error.message
      );
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
      setPlaylists(
        playlists.map((playlist) =>
          playlist._id === editPlaylistId
            ? { ...playlist, name: editPlaylistName }
            : playlist
        )
      );
      setEditPlaylistId(null);
      setEditPlaylistName("");
      console.log("Playlist updated:", updatedPlaylist);
    } catch (error) {
      console.error(
        "Error editing playlist:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const addTrackToPlaylist = async () => {
    if (trackName.trim() !== "" && selectedPlaylistId) {
      try {
        console.log("Access Token:", accessToken); // Log the access token for debugging

        const response = await axios.get(SPOTIFY_API_URL, {
          params: {
            q: trackName,
            type: "track",
            limit: 1,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`, // Use access token for Spotify API
          },
        });

        console.log("Spotify Response:", response.data);

        const trackData = response.data.tracks.items[0];
        if (!trackData) {
          console.error("No track found.");
          return;
        }

        const newTrack = {
          title: trackData.name,
          artist: trackData.artists[0].name,
          album: trackData.album.name,
          duration: trackData.duration_ms,
          spotifyId: trackData.id,
        };

        const trackResponse = await axios.post(`${API_URL}/tracks`, newTrack);
        console.log("Track Response:", trackResponse.data);

        await axios.post(`${API_URL}/playlists/${selectedPlaylistId}/tracks`, {
          trackId: trackResponse.data._id,
        });

        // Update the playlists state
        setPlaylists(
          playlists.map((playlist) => {
            if (playlist._id === selectedPlaylistId) {
              return {
                ...playlist,
                tracks: [...playlist.tracks, trackResponse.data],
              };
            }
            return playlist;
          })
        );

        setTrackName("");
        console.log("Track added to playlist:", newTrack);
      } catch (error) {
        console.error(
          "Error adding track:",
          error.response ? error.response.data : error.message
        );
      }
    }
  };

  const deleteTrackFromPlaylist = async (playlistId, trackId) => {
    try {
      await axios.delete(`${API_URL}/tracks/${trackId}`);
      setPlaylists(
        playlists.map((playlist) => {
          if (playlist._id === playlistId) {
            return {
              ...playlist,
              tracks: playlist.tracks.filter((track) => track._id !== trackId),
            };
          }
          return playlist;
        })
      );
      console.log("Track deleted from playlist:", trackId);
    } catch (error) {
      console.error(
        "Error deleting track:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const startEditTrack = (trackId, currentTrackName) => {
    setEditingTrackId(trackId);
    setEditTrackName(currentTrackName);
  };

  const editTrack = async (playlistId, e) => {
    e.preventDefault();
    try {
      const updatedTrack = { title: editTrackName };
      await axios.put(`${API_URL}/tracks/${editingTrackId}`, updatedTrack);

      setPlaylists(
        playlists.map((playlist) => {
          if (playlist._id === playlistId) {
            return {
              ...playlist,
              tracks: playlist.tracks.map((track) =>
                track._id === editingTrackId
                  ? { ...track, title: editTrackName }
                  : track
              ),
            };
          }
          return playlist;
        })
      );

      setEditingTrackId(null);
      setEditTrackName("");
      console.log("Track updated:", updatedTrack);
    } catch (error) {
      console.error(
        "Error editing track:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:4000/spotify/login"; // Updated path
  };

  return (
    <div>
      {/* Add Playlist */}
      <div>
        <button onClick={handleSpotifyLogin}>Login with Spotify</button>
      </div>
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
        {playlists.map((playlist) => (
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
                <button type="button" onClick={() => setEditPlaylistId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                {playlist.name}
                <button onClick={() => deletePlaylist(playlist._id)}>
                  Delete
                </button>
                <button
                  onClick={() => startEditPlaylist(playlist._id, playlist.name)}
                >
                  Edit
                </button>
              </>
            )}

            {/* List of Tracks */}
            {playlist.tracks.length > 0 && (
              <ul>
                {playlist.tracks.map((track) => (
                  <li key={track._id}>
                    {editingTrackId === track._id ? (
                      <form onSubmit={(e) => editTrack(playlist._id, e)}>
                        <input
                          type="text"
                          value={editTrackName}
                          onChange={(e) => setEditTrackName(e.target.value)}
                          required
                        />
                        <button type="submit">Update</button>
                        <button
                          type="button"
                          onClick={() => setEditingTrackId(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        {track.title} by {track.artist}
                        <button
                          onClick={() => startEditTrack(track._id, track.title)}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            deleteTrackFromPlaylist(playlist._id, track._id)
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Add Track to Playlist */}
      {playlists.length > 0 && (
        <div>
          <h3>Manage Tracks</h3>
          <select
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
            value={selectedPlaylistId}
          >
            <option value="" disabled>
              Select a Playlist
            </option>
            {playlists.map((playlist) => (
              <option key={playlist._id} value={playlist._id}>
                {playlist.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
            placeholder="Track Name"
            required
          />
          <button onClick={addTrackToPlaylist}>Add Track</button>
        </div>
      )}
    </div>
  );
}

export default Playlists;
