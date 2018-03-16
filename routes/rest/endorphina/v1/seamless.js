const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const randomstring = require('randomstring');
const { apiErr } = require('./apiErrHandler');
const { validQuery, convertCredits, getBalance } = require('./helpers');
const mongodbHandle = require('./dbHandler');
const express = require('express');
const router = express.Router();

// Load Model
const Session = require('../../../../models/Session');
const Player = require('../../../../models/Player');
const Transaction = require('../../../../models/Transaction');

router.get('/session', (req, res) => {
    let globalSession;
    const reqParams = req.query;
    console.log(reqParams);

    if(!validQuery(req.path, reqParams)) return apiErr(res, 'ACCESS_DENIED');

    Session.findOne({sessionId: reqParams.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            if(session.active === false) return apiErr(res, 'TOKEN_EXPIRED');
            else return Player.findOne({playerId: session.playerId}).exec();
        
        } else return apiErr(res, 'TOKEN_NOT_FOUND');
    })

    .then(player => {
        if(player) {
            const liveBalance = player.wallet.find( wallet => wallet.currency === globalSession.currency).balance;
            return res.status(200).json({
                player: globalSession.playerId,
                currency: globalSession.currency,
                game: globalSession.gameId
            })
        } else {   
            return apiErr(res, 'INTERNAL_ERROR');
        }
    })

    .catch(err => {return apiErr(res, 'INTERNAL_ERROR');});
});

router.get('/balance', (req, res) => {
    let globalSession;
    const reqParams = req.query;

    if(!validQuery(req.path, reqParams)) return apiErr(res, 'ACCESS_DENIED');

    Session.findOne({sessionId: reqParams.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            return Player.findOne({playerId: session.playerId}).exec();
        } else return apiErr(res, 'TOKEN_NOT_FOUND');
    })

    .then(player => {
        if(player) {
            const liveBalance = player.wallet.find( wallet => wallet.currency === globalSession.currency).balance;
            return res.status(200).json({
                balance: convertCredits.toEndorphina(liveBalance)
            })
        } else return apiErr(res, 'INTERNAL_ERROR');
    })

    .catch(err => {return apiErr(res, 'INTERNAL_ERROR');});
});

router.post('/bet', (req, res) => {
    let globalSession;
    let globalPlayer;
    let globalTransaction;
    const reqParams = req.body;

    console.log('query', req.query)
    console.log('body', req.body)
    console.log('params', req.params)

    if(!validQuery(req.path, reqParams)) return apiErr(res, 'ACCESS_DENIED');

    Session.findOne({sessionId: reqParams.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            if(session.active === false) return apiErr(res, 'TOKEN_EXPIRED');
            else return Player.findOne({playerId: session.playerId}).exec();
        
        } else return apiErr(res, 'TOKEN_NOT_FOUND');
    })

    .then(player => {
        if(player) {
            globalPlayer = player;
            return Transaction.findOne({providerTransactionId: reqParams.id}).exec();
        
        } else return apiErr(res, 'INTERNAL_ERROR');
    })

    .then(transaction => {        
        if(transaction){
            return res.status(200).json({
                transactionId: transaction.transactionId,
                balance: convertCredits.toEndorphina(getBalance(globalPlayer, globalSession.currency))
            });
        } else {
            const params = {
                amount: convertCredits.toInternal(reqParams.amount),
                transactionId: randomstring.generate(32),
                roundId: reqParams.gameId,
                type: 'bet',
                status: 'success',
                sessionId: globalSession.sessionId,
                providerTransactionId: reqParams.id
            }

            // Deduct money
            let balance = getBalance(globalPlayer, globalSession.currency);
            if(balance < params.amount) return apiErr(res, 'INSUFFICIENT_FUNDS');
            else balance -= params.amount;
            
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

    .catch(err => {return apiErr(res, 'INTERNAL_ERROR')});
});

router.post('/refund', (req, res) => {
    let globalSession;
    let globalPlayer;
    let globalTransaction;
    const reqParams = req.body;

    if(!validQuery(req.path, reqParams)) return apiErr(res, 'ACCESS_DENIED');

    Session.findOne({sessionId: reqParams.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            return Player.findOne({playerId: session.playerId}).exec();
       
        } else return apiErr(res, 'TOKEN_NOT_FOUND');
    })

    .then(player => {
        if(player) {
            globalPlayer = player;
            return Transaction.findOne({
                providerTransactionId: reqParams.id,
                // WRONG - 'status': 'success'
            }).exec();
        } else return apiErr(res, 'INTERNAL_ERROR');
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
                amount: convertCredits.toInternal(reqParams.amount),
                transactionId: randomstring.generate(32),
                providerBetTransactionId: reqParams.bettransactionid,
                roundId: reqParams.gameId,
                type: 'refund',
                status: 'success',
                sessionId: globalSession.sessionId,
                providerTransactionId: reqParams.id
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

    .catch(err => {return apiErr(res, 'INTERNAL_ERROR');});
});

router.post('/win', (req, res) => {
    let globalSession;
    let globalPlayer;
    let globalTransaction;
    const reqParams = req.body;
    
    if(!validQuery(req.path, reqParams)) return apiErr(res, 'ACCESS_DENIED');

    Session.findOne({sessionId: reqParams.token}).exec()
    .then(session => {
        if(session){
            globalSession = session;
            return Player.findOne({playerId: session.playerId}).exec();

        } else return apiErr(res, 'TOKEN_NOT_FOUND');
    })

    .then(player => {
        if(player) {
            globalPlayer = player;
            return Transaction.findOne({
                providerTransactionId: reqParams.id,
            }).exec();
        } else return apiErr(res, 'INTERNAL_ERROR');
    })

    .then(transaction => {
        globalTransaction = transaction; 
        if(transaction){
            console.log('WIN Transaction was found an response is success');
            return res.status(200).json({
                transactionId: transaction.transactionId,
                balance: convertCredits.toEndorphina(getBalance(globalPlayer, globalSession.currency))
            });
        } else {
            const params = {
                amount: convertCredits.toInternal(reqParams.amount),
                transactionId: randomstring.generate(32),
                roundId: reqParams.gameId,
                type: 'win',
                status: 'success',
                sessionId: globalSession.sessionId,
                providerTransactionId: reqParams.id
            }

            // Deduct money
            let balance = getBalance(globalPlayer, globalSession.currency);
            balance += params.amount;
            // Save transaction
            mongodbHandle.save('transactions', params);
            // Update players balance
            mongodbHandle.update('balance', { globalSession, balance });
            // Response
            console.log('WIN transaction was NOT found and response is touched balance');
            return res.status(200).json({
                transactionId: params.transactionId,
                balance: convertCredits.toEndorphina(balance)
            });
        }
        })

    .catch(err => {return apiErr(res, 'INTERNAL_ERROR');});
});


module.exports = router;