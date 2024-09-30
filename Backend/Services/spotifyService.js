const axios = require('axios'); // Import axios for HTTP requests
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
    console.log('Loaded tokens:', JSON.parse(data));
    return JSON.parse(data);
  }
  return {};
};

const saveTokens = (tokenData) => {
  console.log('Saving token data:', tokenData);
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokenData, null, 2));
};

const tokens = loadTokens();
accessToken = tokens.accessToken || '';
refreshToken = tokens.refreshToken || '';
tokenExpiry = tokens.tokenExpiry || 0;


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
    console.error('Failed to exchange authorization code for tokens:', error.response ? error.response.data : error.message);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

async function getSpotifyAccessToken() {
  if (Date.now() < tokenExpiry) {
    console.log('Using the existing token');
    return accessToken;
  }

  return await refreshAccessToken(); 
}

async function refreshAccessToken() {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET
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
    console.error('Could not refresh Spotify access token:', error.response ? error.response.data : error.message);
    throw new Error('Could not refresh Spotify access token');
  }
}

module.exports = { handleCallback, getSpotifyAccessToken };
