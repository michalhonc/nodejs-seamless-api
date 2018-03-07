const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    providerBetTransactionId: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    roundId: {
        type: String,
        required: true
    },
    providerTransactionId: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('transactions', TransactionSchema);