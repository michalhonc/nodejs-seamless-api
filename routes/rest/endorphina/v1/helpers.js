const sha1 = require('sha1');
const uuid = require('uuid');

// Load keys
const keys = require('../config/keys');

module.exports = {
    generateUUID: () => {
        return uuid().replace(/-/g, '').toUpperCase();
    },
    getBalance: (player, sessionCurrency) => {
        return player.wallet.find( wallet => wallet.currency === sessionCurrency).balance;
    },
    convertCredits: {
        toInternal: function(amount) {
            // Endorphina credits => 10 EUR === 10000
            return amount / 10;
        },
        toEndorphina: function(amount) {
            // Internal credits => 10 EUR === 1000
            return amount * 10;
        },
    },
    validQuery: (method, query) => {
        const sign = module.exports.getSign(query);
        let gQuery;
        switch (method) {
            case '/session':
                gQuery = query.token && query.sign===sign;
                break;

            case '/balance':
                gQuery = query.token && query.sign===sign;
                break;

            case '/bet':
                gQuery = query.token && query.amount && query.gameId && query.id && query.date && query.sign===sign;
                break;

            case '/refund':
                gquery = query.token && query.amount && query.gameId && query.id && query.date && query.betTransactionId && query.sign===sign;
                break;
            
            case '/win':
                gquery = query.token && query.amount && query.gameId && query.id && query.date  && query.sign===sign;
                break;
            
            default:
                gQuery = query.sign===sign;
                break;
        }
        if(query.sign===sign){
            return true;
        } else {
            console.log(query);
            return false;
        }
    },
    getSign: (query) => {
        //VALIDATE QUERY?
        const salt = keys.node.salt;
        const orderedQuery = {};
        // Orded query by alphabet
        Object.keys(query).sort().forEach(function(key) {
            orderedQuery[key] = query[key];
            }
        );
        delete orderedQuery.sign; // Remove sign param
        let queryValues = Object.values(orderedQuery) // Concate sign and join 
            .join("");
        queryValues += salt;
        const sign = sha1(queryValues);
        return sign;
    }
}