const mongoose = require('mongoose')
const keys = require('../config/keys');

module.exports = () => {
    // Mongoose connect
    mongoose.connect(keys.mongoURI)
        .then(() => console.log('Mongo connected'))
        .catch(() => console.log(err));
}