const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send({ msg: "Access Denied: No Token Provided", status: false });
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        console.log(error);
        return res.status(400).send({ msg: "Invalid Token", status: false });
    }
};

const isLoggedIn = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ msg: "User Not Found!", status: false });
        }
        req.user = user; 
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Internal Server Failure", status: false });
    }
};

module.exports = { verifyToken, isLoggedIn };
