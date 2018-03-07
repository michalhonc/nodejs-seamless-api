const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const { apiErr } = require('./errorCodes');
const { validQuery, convertCredits, getBalance } = require('./helpers');
const mongodbHandle = require('./dbHandler');
const express = require('express');
const router = express.Router();

// Load Model
const Session = require('../../../../models/Session');
const Player = require('../../../../models/Player');
const Transaction = require('../../../../models/Transaction');

router.get('/session', (req, res) => {
    let err;
    let globalSession;

    if(!validQuery(req.path, req.query)){
        err = apiErr('ACCESS_DENIED', 'The authentication credentials for the API are incorrect');
        return res.status(404).json(err); 
    }

    Session.findOne({sessionId: req.query.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            console.log('session found');
            if(session.active === false){
                console.log('session inactive');
                err = apiErr('TOKEN_EXPIRED', 'The session token expired');
                return res.status(403).json(err);
            } else {
                console.log('session active: ', session);
                return Player.findOne({playerId: session.playerId}).exec();
            }
        } else {
            console.log('session not found');
            err = apiErr('TOKEN_NOT_FOUND', 'The session token is invalid');
            return res.status(404).json(err);
        }
    })

    .then(player => {
        if(player) {
            console.log('player found: ', player);
            const liveBalance = player.wallet.find( wallet => wallet.currency === globalSession.currency).balance;
            return res.status(200).json({
                player: globalSession.playerId,
                currency: globalSession.currency,
                game: globalSession.gameId
            })
        } else {
            console.log('player not found');
            err = apiErr('INTERNAL_ERROR', 'Player not found');
            return res.status(500).json(err);
        }
    })

    .catch(err => {        
        // Unhandled error
        console.log('catch found: ', err);
        err = apiErr('INTERNAL_ERROR', 'Internal server error');
        return res.status(500).json(err);
    });
});

router.get('/balance', (req, res) => {
    let err;
    let globalSession;

    if(!validQuery(req.path, req.query)){
        err = apiErr('ACCESS_DENIED', 'The authentication credentials for the API are incorrect');
        return res.status(404).json(err); 
    }

    Session.findOne({sessionId: req.query.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            console.log('session found');
            if(session.active === false){
                console.log('session inactive');
                err = apiErr('TOKEN_EXPIRED', 'The session token expired');
                return res.status(403).json(err);
            } else {
                console.log('session active: ', session);
                return Player.findOne({playerId: session.playerId}).exec();
            }
        } else {
            console.log('session not found');
            err = apiErr('TOKEN_NOT_FOUND', 'The session token is invalid');
            return res.status(404).json(err);
        }
    })

    .then(player => {
        if(player) {
            console.log('player found: ', player);
            const liveBalance = player.wallet.find( wallet => wallet.currency === globalSession.currency).balance;
            return res.status(200).json({
                balance: convertCredits.toEndorphina(liveBalance)
            })
        } else {
            console.log('player not found');
            err = apiErr('INTERNAL_ERROR', 'Player not found');
            return res.status(500).json(err);
        }
    })

    .catch(err => {        
        // Unhandled error
        console.log('catch found: ', err);
        err = apiErr('INTERNAL_ERROR', 'Internal server error');
        return res.status(500).json(err);
    });
});

router.post('/bet', (req, res) => {
    let err;
    let globalSession;
    let globalPlayer;
    let globalTransaction;

    // if(!validQuery(req.path, req.query)){
    //     err = apiErr('ACCESS_DENIED', 'The authentication credentials for the API are incorrect');
    //     return res.status(404).json(err); 
    // }

    Session.findOne({sessionId: req.query.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            if(session.active === false){
                err = apiErr('TOKEN_EXPIRED', 'The session token expired');
                return res.status(403).json(err);
            } else {
                return Player.findOne({playerId: session.playerId}).exec();
            }
        } else {
            console.log('session: ',session);
            console.log('req.query: ',req.query);
            console.log('req: ',req);
            err = apiErr('TOKEN_NOT_FOUND', 'The session token is invalid');
            return res.status(404).json(err);
        }
    })

    .then(player => {
        if(player) {
            globalPlayer = player;
            return Transaction.findOne({providerTransactionId: req.query.id}).exec();
        } else {
            err = apiErr('INTERNAL_ERROR', 'Player not found');
            return res.status(500).json(err);
        }
    })

    .then(transaction => {        
        if(transaction){
            console.log('transaction already exists');
            return res.status(200).json({
                transactionId: transaction.transactionId,
                balance: convertCredits.toEndorphina(getBalance(globalPlayer, globalSession.currency))
            });
        } else {
            const params = {
                amount: convertCredits.toInternal(req.query.amount),
                transactionId: randomstring.generate(32),
                roundId: req.query.gameId,
                type: 'bet',
                status: 'success',
                sessionId: globalSession.sessionId,
                providerTransactionId: req.query.id
            }

            // Deduct money
            let balance = getBalance(globalPlayer, globalSession.currency);
            if(balance < params.amount){
                err = apiErr('INSUFFICIENT_FUNDS', 'Player has insufficient funds');
                return res.status(402).json(err);
            } else {
                balance -= params.amount;
            }
            // Save transaction
            mongodbHandle.save('transactions', params);
            // Update players balance
            mongodbHandle.update('balance', { globalSession, balance });
            // Response
            return res.status(200).json({
                transactionId: params.transactionId,
                balance: convertCredits.toEndorphina(balance)
            });
        }
    })

    .catch(err => {        
        // Unhandled error
        console.log('catch found: ', err);
        err = apiErr('INTERNAL_ERROR', 'Internal server error');
        return res.status(500).json(err);
    });
});

router.post('/refund', (req, res) => {
    let err;
    let globalSession;
    let globalPlayer;
    let globalTransaction;

    // if(!validQuery(req.path, req.query)){
    //     err = apiErr('ACCESS_DENIED', 'The authentication credentials for the API are incorrect');
    //     return res.status(404).json(err); 
    // }

    Session.findOne({sessionId: req.query.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            if(session.active === false){
                err = apiErr('TOKEN_EXPIRED', 'The session token expired');
                return res.status(403).json(err);
            } else {
                return Player.findOne({playerId: session.playerId}).exec();
            }
        } else {
            err = apiErr('TOKEN_NOT_FOUND', 'The session token is invalid');
            return res.status(404).json(err);
        }
    })

    .then(player => {
        if(player) {
            globalPlayer = player;
            return Transaction.findOne({
                providerTransactionId: req.query.id,
                // WRONG - 'status': 'success'
            }).exec();
        } else {
            err = apiErr('INTERNAL_ERROR', 'Player not found');
            return res.status(500).json(err);
        }
    })

    .then(transaction => {
        globalTransaction = transaction; 
        if(transaction){
            return res.status(200).json({
                transactionId: transaction.transactionId,
                balance: convertCredits.toEndorphina(getBalance(globalPlayer, globalSession.currency))
            });
        } else {
            const params = {
                amount: convertCredits.toInternal(req.query.amount),
                transactionId: randomstring.generate(32),
                providerBetTransactionId: req.query.bettransactionid,
                roundId: req.query.gameId,
                type: 'refund',
                status: 'success',
                sessionId: globalSession.sessionId,
                providerTransactionId: req.query.id
            }

            // Deduct money
            let balance = getBalance(globalPlayer, globalSession.currency);
            balance += params.amount;
            // Save transaction
            mongodbHandle.save('transactions', params);
            // Update players balance
            mongodbHandle.update('balance', { globalSession, balance });
            // Update bet transaction to be 'refunded'
            mongodbHandle.update('betRefunded', params);
            // Response
            return res.status(200).json({
                transactionId: params.transactionId,
                balance: convertCredits.toEndorphina(balance)
            });
        }
        })

    .catch(err => {        
        // Unhandled error
        console.log('catch found: ', err);
        err = apiErr('INTERNAL_ERROR', 'Internal server error');
        return res.status(500).json(err);
    });
});

router.post('/win', (req, res) => {
    let err;
    let globalSession;
    let globalPlayer;
    let globalTransaction;

    // if(!validQuery(req.path, req.query)){
    //     err = apiErr('ACCESS_DENIED', 'The authentication credentials for the API are incorrect');
    //     return res.status(404).json(err); 
    // }

    Session.findOne({sessionId: req.query.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            if(session.active === false){
                err = apiErr('TOKEN_EXPIRED', 'The session token expired');
                return res.status(403).json(err);
            } else {
                return Player.findOne({playerId: session.playerId}).exec();
            }
        } else {
            err = apiErr('TOKEN_NOT_FOUND', 'The session token is invalid');
            return res.status(404).json(err);
        }
    })

    .then(player => {
        if(player) {
            globalPlayer = player;
            console.log('Actual balance in DB: ', globalPlayer);
            return Transaction.findOne({
                providerTransactionId: req.query.id,
                // TRANSACTION IS NOT FAILED - 'status': 'success'
            }).exec();
        } else {
            err = apiErr('INTERNAL_ERROR', 'Player not found');
            return res.status(500).json(err);
        }
    })

    .then(transaction => {
        globalTransaction = transaction; 
        if(transaction){
            return res.status(200).json({
                transactionId: transaction.transactionId,
                balance: convertCredits.toEndorphina(getBalance(globalPlayer, globalSession.currency))
            });
        } else {
            const params = {
                amount: convertCredits.toInternal(req.query.amount),
                transactionId: randomstring.generate(32),
                roundId: req.query.gameId,
                type: 'win',
                status: 'success',
                sessionId: globalSession.sessionId,
                providerTransactionId: req.query.id
            }

            // Deduct money
            let balance = getBalance(globalPlayer, globalSession.currency);
            balance += params.amount;
            // Save transaction
            mongodbHandle.save('transactions', params);
            // Update players balance
            mongodbHandle.update('balance', { globalSession, balance });
            // Response
            return res.status(200).json({
                transactionId: params.transactionId,
                balance: convertCredits.toEndorphina(balance)
            });
        }
        })

    .catch(err => {        
        // Unhandled error
        console.log('catch found: ', err);
        err = apiErr('INTERNAL_ERROR', 'Internal server error');
        return res.status(500).json(err);
    });
});


module.exports = router;