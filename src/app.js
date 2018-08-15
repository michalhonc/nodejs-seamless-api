'use strict';
const express = require('express')
const app = express()

// Mongoose
require('./middleware/mongoose')()

// Middleware
require('./middleware/middlewares')(app)

// Server settings
require('./middleware/server')(app)

// Routes
require('./middleware/routes')(app, express)

// Port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
