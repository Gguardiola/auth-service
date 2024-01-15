const express = require('express');
const auth = require('./routes/auth');
const app = express();
app.use(express.json());
if(process.env.NODE_ENV != "production") require('dotenv').config();

const LISTEN_PORT = process.env.PORT;

app.use('/auth', auth);

app.listen(LISTEN_PORT, () => {
    console.log("AUTH-SERVICE is running on port "+ LISTEN_PORT);

});