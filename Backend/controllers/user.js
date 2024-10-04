const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();

const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).send({ msg: "Username, email, and password are required", status: false });
        }

        let oldUser = await User.findOne({ username });
        let oldEmail = await User.findOne({ email });
        if (oldUser || oldEmail) {
            return res.status(409).send({ msg: "Username/Email already exists, please choose another!" });
        }

        let hashPassword = await bcrypt.hash(password, 12);
        let newUser = await User.create({ username, email, password: hashPassword });
        return res.status(201).send({ msg: "User created successfully", newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ msg: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ msg: "Email and password are required", status: false });
        }

        const oldUser = await User.findOne({ email });
        if (!oldUser) {
            return res.status(404).send({ msg: "User does not exist, please sign up first!", status: false });
        }
        const isPasswordValid = await bcrypt.compare(password, oldUser.password);
        if (!isPasswordValid) return res.status(401).send({ msg: "Wrong password", status: false });

        const payload = { id: oldUser._id, email: oldUser.email, username: oldUser.username }; // Include username

        const token = await jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });
        return res.status(200).send({ msg: "Login successfully!", status: true, token, username: oldUser.username }); // Include username in response
    } catch (error) {
        console.error(error);
        return res.status(500).send({ msg: "Server failed", status: false });
    }
};

module.exports = { login, register };
