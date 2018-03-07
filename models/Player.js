const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    playerId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String
    },
    email: {
        type: String
    },
    lastName: {
        type: String
    },
    date: [{
        dateOfBirth: {
            type: Date
        },
        dateOfRegistration: {
            type: Date,
        }
    }],
    wallet: [{
        balance: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        }
    }],
    active: {
        type: Boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model('players', PlayerSchema);