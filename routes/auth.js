const router = require('express').Router();
const {check, validationResult} = require('express-validator');
const {users} = require('../db');
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
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

    //db validation

    let user = users.find(user => {return user.email === email});
    if(user) {
        console.log("Error: User already exists");
        return res.status(401).json({success: false, message: [{message: "User already exists"}]});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({email, password: hashedPassword});
    //TODO: store the secret on dot env
    const token = await JWT.sign({email}, SECRET_KEY, {expiresIn: "48h"});

    res.json({success: true, token});

});

router.post('/login', async (req, res) => {
    const {password, email} = req.body;
    let user = users.find(user => {return user.email === email});
    if(!user) {
        console.log("Error: Invalid credentials");
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
        console.log("Error: Invalid credentials");
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = await JWT.sign({email}, SECRET_KEY, {expiresIn: "48h"});

    res.json({success: true, token});

});

router.post('/validate', async (req, res) => {
    const {authorization} = req.body;
    if(!authorization) {
        console.log("Error: Token not provided");
        return res.status(400).json({ success: false, message: 'Token not provided' });
    }

    try {
        const decoded = await JWT.verify(authorization, SECRET_KEY);
        res.json({success: true, user: decoded});
    } catch (error) {
        console.log("Error: Invalid token");
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
});
module.exports = router;