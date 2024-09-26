const fs = require('fs');
const path = require('path');

const TOKEN_FILE_PATH = path.join(__dirname, '../tokens.json');

exports.getToken = (req, res) => {
  try {
    
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const tokenData = fs.readFileSync(TOKEN_FILE_PATH);
      const tokens = JSON.parse(tokenData);
      res.status(200).json(tokens); 
    } else {
      res.status(404).json({ message: 'Token file not found' });
    }
  } catch (error) {
    console.error('Error reading token file:', error);
    res.status(500).json({ message: 'Failed to retrieve token' });
  }
};
