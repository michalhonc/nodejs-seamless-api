const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true
    },
    playerId: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    node: {
        type: String,
        required: true,
        default: 'common'
    }
});

module.exports = mongoose.model('sessions', SessionSchema);