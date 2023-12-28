const router = require('express').Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const db = require('../database/queries')

if(process.env.NODE_ENV != "production") require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET

router.post('/signup', [
    check("email","Please provide a valid email.").isEmail(),
    check("password","Please provide a password than is greater than 5 characters").isLength({min: 6}),
    check("username","Please provide a username").isLength({min: 1}),
    check("lastname","Please provide a lastname").isLength({min: 1}),
    check("birthday","Please provide a valid date").isISO8601().toDate()

], async (req, res) => {
    const {password, email, username, lastname, birthday} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log("Error validating input: "+errors.array());
        return res.status(400).json({success: false, message: errors.array()});
    }

    try{
        let user = await db.checkIfUserExists(email);
        if(user.rows.length > 0) {
            console.log("Error: User already exists");
            return res.status(401).json({success: false, message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.insertUser(email, hashedPassword, username, lastname, birthday);

        res.json({success: true, message: "Signup successful"});
    } catch(error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/login',[
    check("email","Please provide a valid email.").isEmail(),
    check("password","Please provide a password than is greater than 5 characters").isLength({min: 6})
], async (req, res) => {
    const {password, email} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log("Error validating input: "+errors.array());
        return res.status(400).json({success: false, message: errors.array()});
    }

    try{
        let user = await db.checkIfUserExists(email);
        if(!user.rows.length > 0) {
            console.log("Error: User NOT exists");
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        user = user.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        
        let isLogged = await db.checkIfUserIsLogged(JSON.stringify(user.id));
        if(isLogged.rows.length > 0) {
            console.log("User already logged");
            return res.json({success: true, token: isLogged.rows[0].token});
        }

        const token = await JWT.sign({ userId: user.id }, SECRET_KEY, {expiresIn: "48h"});
        await db.startSession(user.id, token);

        res.json({success: true, token});
    } catch(error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/logout', async (req, res) => {
    const authorization  = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ success: false, message: 'Token not provided' });
    }
    try {
        const decoded = await JWT.verify(authorization, SECRET_KEY);
        await db.logoutUser(authorization);
        res.json({ success: true, message: 'Logout successful' });

    } catch (error) {
        console.error('Error during validation:', error);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'SyntaxError') {
            // Token is invalid
            console.log("Error: Invalid token");
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/validate', async (req, res) => {
    const authorization = req.headers.authorization;

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
        try{
            const decoded = await JWT.verify(authorization, SECRET_KEY);
            res.json({success: true, userId: decoded.userId});

        } catch(error) {
            console.error('Error during validation jwt token:', error);
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    
    } catch (error) {
        console.error('Error during validation:', error);

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            // Token is invalid
            console.log("Error: Invalid token");
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
module.exports = router;