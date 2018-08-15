const mongoose = require('mongoose');
const express = require('express');

// Load Model
const Session = require('../../models/Session');
const Player = require('../../models/Player');
const Transaction = require('../../models/Transaction');
const Game = require('../../models/Game');

const db = {
    save: function(collection, params) {
        function getCol(collection) {
            var col = {
                'games':  () => {
                    return new Game(params).save()
                },
                'players':  () => {
                    return new Player(params).save()
                },
                'sessions':  () => {
                    return new Session(params).save()
                },
                'transactions':  () => {
                    return new Transaction(params).save()
                },
            };
        return col[collection]            
        }
        getCol(collection)()
            .then(result => {
                if(result) {
                    return result;
                } else {
                    return false;
                }
            })
    },
    update: function(collection, params) {
        switch (collection) {
            case 'balance':
                Player.findOneAndUpdate({
                    playerId: params.session.playerId 
                    },
                    {'wallet.balance': params.balance},
                    {new: true},
                )
                .catch(err => {
                    throw new err;
                })
                return;
                break;

           
            
            case 'betRefunded':
                console.log('betrefunded: ', params);
                Transaction.findOneAndUpdate({providerTransactionId: params.providerBetTransactionId},
                    {'status': 'refunded'},
                    {new: true},
                )
                .catch(err => {
                    throw new err;
                })
                return;
                break;
        
            default:
                break;
        }
        return;
        
    },
    delete: function(collection, params) {
        
    },
    findOne: function(collection, key) {
        return new Promise((resolve, reject) => {   
            function getCol(collection) {
                const col = {
                    'games':  () => {
                        return Game.findOne({gameId: key.gameId}).exec()
                    },
                    'players':  () => {
                        return Player.findOne({playerId: key}).exec()
                    },
                    'sessions':  () => {
                        return Session.findOne({sessionId: key}).exec()
                    },
                    'transactions':  () => {
                        return Transaction.findOne({providerTransactionId: key}).exec()
                    }
                };
            return col[collection]            
            }
            getCol(collection)()
            .then(result => {
                if (result) {
                    resolve(result);
                } else {
                    resolve(false);
                }
            })
            .catch(err => {
                reject(err);
            });
        });
    },
    find: function(collection, res) {
        function getQuery(collection) {
            var col = {
                'games':  () => {
                    return Game.find({}).exec()
                },
                'players':  () => {
                    return Player.find({}).exec()
                },
                'sessions':  () => {
                    return Session.find({}).exec()
                },
                'transactions':  () => {
                    return Transaction.fin({providerTransactionId: key}).exec()
                },
            };
        return col[collection]            
        }
        getCol(collection)()
            .then(result => {
                if(result) {
                    return result;
                } else {
                    return false;
                }
            })
    }
}

module.exports = db;