const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

   
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authorization header is missing or malformed.');
        return res.status(401).send({ msg: 'Access Denied: No Token Provided', status: false });
    }

    
    const token = authHeader.split(' ')[1];

    try {
      
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;  
        next(); 
    } catch (error) {
        console.error('Error verifying token:', error); 
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ msg: 'Token Expired', status: false });
        } else {
            return res.status(400).send({ msg: 'Invalid Token', status: false });
        }
    }
};


const isLoggedIn = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found in database.');
            return res.status(404).send({ msg: 'User Not Found!', status: false });
        }
        req.user = user; 
        console.log('User found:', req.user); 
        next(); 
    } catch (error) {
        console.error('Database error while checking user:', error); 
        return res.status(500).send({ msg: 'Internal Server Failure', status: false });
    }
};

module.exports = { verifyToken, isLoggedIn };
