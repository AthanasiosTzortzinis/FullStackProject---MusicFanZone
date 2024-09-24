const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();


const register = async( req, res)=>{
    try {
        let{username, email, password} = req.body;
        if (!username || !email || !password) {
            return res
            .status(400)
            .send({msg: "Both password and email are required" , status:false});
        }


        let oldUser = await User.findOne({username});
        let oldEmail = await User.findOne({email});
        if(oldUser || oldEmail){
            return res
            .status(400)
            .send({msg:"Username/Email already exist, login or sign up with a new!"})
        } 

        let hashPassword = await bcrypt.hash(password,12);
        let newUser = await User.create({username, email, password: hashPassword});
        return res
        .status(200)
        .send({msg:"User created Successfully", newUser});
    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .send({msg:"Internal server Error"});
    }
    };

    
    const login = async(req, res)=>{
        try {
            const {email ,password } = req.body;
            if (!email || !password){
                return res
                .status(400)
                .send({msg:"Email and Password are required!", status:false});
            }

            const oldUser = await User.findOne({email});
            if (!oldUser){
                return res.send({
                msg:"User does not exist, please sign up first!", status:false});
            }
            const isPasswordValid = await bcrypt.compare(password, oldUser.password);
            if (!isPasswordValid) return res.send({msg:"Wrong password"});


            const payload = {
                id: oldUser._id,
                email: oldUser.email
            };

            const token = await jwt.sign(payload, process.env.SECRET_KEY,{expiresIn: "1h"})
            return res.status(200).send({msg:"login successfully!", status: true, token});

        } catch (error) {
           console.log(error);
           return res.status(500).send({msg:"Server failed", status:false}); 
        }
       }
 
module.exports = {login,register};