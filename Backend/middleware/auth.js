const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// Middleware to verify the token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present and formatted correctly
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authorization header is missing or malformed.');
        return res.status(401).send({ msg: 'Access Denied: No Token Provided', status: false });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified; // Use the verified token directly
        console.log('Token verified successfully:', req.user); // Log the verified token
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error verifying token:', error); // Log the error for debugging
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ msg: 'Token Expired', status: false });
        } else {
            return res.status(400).send({ msg: 'Invalid Token', status: false });
        }
    }
};

// Middleware to check if the user is logged in
const isLoggedIn = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found in database.');
            return res.status(404).send({ msg: 'User Not Found!', status: false });
        }
        req.user = user; // Store the user object in the request
        console.log('User found:', req.user); // Log the user object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Database error while checking user:', error); // Log the error for debugging
        return res.status(500).send({ msg: 'Internal Server Failure', status: false });
    }
};

module.exports = { verifyToken, isLoggedIn };
