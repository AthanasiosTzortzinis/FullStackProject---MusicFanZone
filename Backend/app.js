const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const playlistRoutes = require('./routes/playlistRoutes');
const trackRoutes = require('./routes/trackRoutes');
const spotifyRoutes = require('./routes/spotifyRoutes');
const fs = require('fs');
const path = require('path');

dotenv.config(); 

const app = express();
const port = process.env.PORT || 4000; 

app.use(cors()); 
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Welcome to the MusicFanZone');
});

app.use('/playlists', playlistRoutes);
app.use('/tracks', trackRoutes);
app.use('/spotify', spotifyRoutes); 

const TOKEN_FILE_PATH = path.join('../tokens.json');

const loadTokens = () => {
  if (fs.existsSync(TOKEN_FILE_PATH)) {
    const data = fs.readFileSync(TOKEN_FILE_PATH);
    return JSON.parse(data);
  }
  return {};
};

const saveTokens = (tokenData) => {
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokenData));
};

const tokens = loadTokens();
const accessToken = tokens.accessToken || '';
const tokenExpiry = tokens.tokenExpiry || 0;

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
