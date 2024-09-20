const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const TOKEN_FILE_PATH = path.join(__dirname, '../tokens.json');

let accessToken = '';
let tokenExpiry = 0;


const loadTokens = () => {
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    const data = fs.readFileSync(TOKEN_FILE_PATH);
    return JSON.parse(data);
  }
  return {};
};


const saveTokens = (tokenData) => {
  console.log('Saving tokens to file:', tokenData);
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokenData, null, 2)); 
};


const tokens = loadTokens();
accessToken = tokens.accessToken || '';
tokenExpiry = tokens.tokenExpiry || 0;

async function getSpotifyAccessToken() {
  if (Date.now() < tokenExpiry) {
    console.log('Token is still valid, returning existing token.');
    return accessToken; 
  }

  console.log('Token is expired or missing. Fetching new token...');
  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'client_credentials'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      }
    });

    accessToken = tokenResponse.data.access_token;
    tokenExpiry = Date.now() + (tokenResponse.data.expires_in * 1000); 

    console.log('New token obtained:', accessToken);
    console.log('Token will expire at:', new Date(tokenExpiry).toISOString());

    saveTokens({ accessToken, tokenExpiry }); 

    return accessToken;
  } catch (error) {
    console.error('Error fetching Spotify access token:', error.response ? error.response.data : error.message);
    throw new Error('Could not get Spotify access token');
  }
}

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
    console.error('Error searching tracks:', error.response ? error.response.data : error.message);
    throw new Error('Could not search tracks');
  }
}

module.exports = { getSpotifyAccessToken, searchTracks };
