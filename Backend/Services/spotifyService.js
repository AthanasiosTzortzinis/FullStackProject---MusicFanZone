const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const TOKEN_FILE_PATH = path.join(__dirname, '../tokens.json');

let accessToken = '';
let refreshToken = '';
let tokenExpiry = 0;

const loadTokens = () => {
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    const data = fs.readFileSync(TOKEN_FILE_PATH);
    return JSON.parse(data);
  }
  return {};
};

const saveTokens = (tokenData) => {
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokenData, null, 2));
};

const tokens = loadTokens();
accessToken = tokens.accessToken || '';
refreshToken = tokens.refreshToken || '';
tokenExpiry = tokens.tokenExpiry || 0;

// Handles Spotify callback and exchanges the authorization code for access and refresh tokens
async function handleCallback(code) {
  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    accessToken = tokenResponse.data.access_token;
    refreshToken = tokenResponse.data.refresh_token;
    tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    saveTokens({ accessToken, refreshToken, tokenExpiry });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

// Refreshes the access token using the refresh token
async function refreshAccessToken() {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      }
    });

    accessToken = tokenResponse.data.access_token;
    tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000);

    saveTokens({ accessToken, refreshToken, tokenExpiry });

    return accessToken;
  } catch (error) {
    throw new Error('Could not refresh Spotify access token');
  }
}

// Retrieves the access token; refreshes if expired
async function getSpotifyAccessToken() {
  if (Date.now() < tokenExpiry) {
    return accessToken;
  }

  return await refreshAccessToken();
}

// Searches for tracks using the Spotify API
async function searchTracks(query) {
  try {
    const token = await getSpotifyAccessToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: query,
        type: 'track',
        limit: 10
      }
    });

    return response.data;
  } catch (error) {
    throw new Error('Could not search tracks');
  }
}

module.exports = { handleCallback, getSpotifyAccessToken, searchTracks };