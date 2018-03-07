const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const express = require('express');
const app = express();

// Load routes
const index = require('./routes/index/index');
const endorphinaSeamless = require('./routes/rest/endorphina/v1/seamless');

// Load keys
const keys = require('./config/keys');

// Mongoose connect
mongoose.connect(keys.mongoURI)
.then(() => console.log('Mongo connected'))
.catch(() => console.log(err));

/*
    MIDDLEWARE
*/
// bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Use routes
app.use('/', index);
app.use('/rest/endorphina/v1', endorphinaSeamless);

app.disable('x-powered-by');
app.disable('etag');

// Port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});


