const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
    provider: {
        type: String,
        required: true
    },
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    technology: [],
    devices: [],
    img: {
        type: String
    },
    tags: []
});

module.exports = mongoose.model('games', GameSchema);