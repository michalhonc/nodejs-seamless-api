'use strict';
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const app = express()
const logger = require('./logs/logger')

// Load routes
const index = require('./routes/index/index');
const endorphinaSeamless = require('./routes/rest/endorphina/v1/seamless');
const endorphinaIndex = require('./routes/rest/endorphina');
const launch = require('./routes/rest/launch/launch');

// Load keys
const keys = require('./config/keys');

// Mongoose connect
mongoose.connect(keys.mongoURI)
    .then(() => console.log('Mongo connected'))
    .catch(() => console.log(err));

/*
    MIDDLEWARE
*/
// Morgan
app.use(morgan("combined", { "stream": logger.stream }));

// bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Use routes
app.use('/', index)
app.use('/rest/launch', launch)
app.use('/rest/endorphina/v1', endorphinaSeamless)
app.use('/rest/endorphina', endorphinaIndex)
app.use('/public/src/img',express.static(__dirname + '/public/src/img'))

app.disable('x-powered-by')
app.disable('etag')

// Port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});


