const router = require('express').Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const db = require('../database/queries')

if(process.env.NODE_ENV != "production") require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET

router.post('/signup', [
    check("email","Please provide a valid email.").isEmail(),
    check("password","Please provide a password than is greater than 5 characters").isLength({min: 6})

], async (req, res) => {
    const {password, email} = req.body;

    //Input validation
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log("Error validating input: "+errors.array());
        return res.status(401).json({success: false, message: errors.array()});
    }

    try{
        let user = await db.checkIfUserExists(email);
        if(user.rows.length > 0) {
            console.log("Error: User already exists");
            return res.status(401).json({success: false, message: [{message: "User already exists"}]});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        //TODO: complete the signup process with the username, lastname and birthdate
        await db.insertUser(email, hashedPassword);
        const token = await JWT.sign({email}, SECRET_KEY, {expiresIn: "48h"});

        res.json({success: true, token});
    } catch(error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const {password, email} = req.body;

    try{
        let user = await db.checkIfUserExists(email);
        if(!user.rows.length > 0) {
            console.log("Error: User NOT exists");
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        user = user.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            console.log('User:', user);
            console.log('Hashed Password:', user.password);
            console.log('Entered Password:', password);
            console.log('Is Password Valid:', isPasswordValid);
            console.log("Error: Invalid credentials");
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = await JWT.sign({email}, SECRET_KEY, {expiresIn: "48h"});

        res.json({success: true, token});
    } catch(error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/logout', async (req, res) => {
    const {authorization} = req.headers;

    if (!authorization) {
        return res.status(401).json({ success: false, message: 'Token not provided' });
    }

    try {
        await db.logoutUser(authorization);
        res.json({ success: true, message: 'Logout successful' });

    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/validate', async (req, res) => {
    const {authorization} = req.body;
    if(!authorization) {
        console.log("Error: Token not provided");
        return res.status(400).json({ success: false, message: 'Token not provided' });
    }

    try {
        const isBlacklisted = await db.checkIfUserTokenBlacklisted(authorization);

        if(isBlacklisted.rows.length > 0) {
            console.log("Error: Token blacklisted");
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        const decoded = await JWT.verify(authorization, SECRET_KEY);
        res.json({success: true, user: decoded});
    } catch (error) {
        console.error('Error during validation:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
module.exports = router;