const sha1 = require('sha1');
const uuid = require('uuid');
const db = require('./dbHandler');

// Load Model
const Session = require('../../models/Session');
const Player = require('../../models/Player');
const Transaction = require('../../models/Transaction');
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
            case '/balance':            
                gQuery = query.token && query.sign===sign;
                break;

            case '/bet':
            case '/win':            
                gQuery = query.token && query.amount && query.gameId && query.id && query.date && query.sign===sign;
                break;

            case '/refund':
                gQuery = query.token && query.amount && query.gameId && query.id && query.date && query.betTransactionId && query.sign===sign;
                break;
            
            default:
                gQuery = query.sign===sign;
                break;
        }
        if(gQuery){
            return true;
        } else {
            console.log('correct sign: ', sign)
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
    },
    getSessionAndPlayer: (res, params) => {
        return new Promise((resolve, reject) => {
            let globalSession;
            db.findOne('sessions', params.token)
                .then(session => {
                    if(session.active === false) resolve(apiErr(res, 'TOKEN_EXPIRED'));
                    globalSession = session;
                    return db.findOne('players', session.playerId);
                })
                .then(player => {
                    if(player) {
                        const result = {
                            session: globalSession,
                            player: player
                        }
                        resolve(result)
                }})
                .catch(err => {
                    resolve(apiErr(res, 'INTERNAL_ERROR'));
                });
        })
        
    },
    getTransaction: (res, params) => {
        return new Promise((resolve, reject) => {
            db.findOne('transactions', params.id)
                .then(transaction => {
                    if(transaction){
                        const result = transaction; 
                        resolve(result)
                    } else {
                        resolve(false)  
                    }
                })
                .catch(err => {return apiErr(res, 'INTERNAL_ERRO')});
        })
        
    }
}