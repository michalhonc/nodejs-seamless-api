const randomstring = require('randomstring');
const { apiErr } = require('./apiErrHandler');
const { validQuery, convertCredits, getBalance, getSessionAndPlayer, getTransaction } = require('./helpers');
const db = require('./dbHandler');

// Load Model
const Session = require('../../models/Session');
const Player = require('../../models/Player');
const Transaction = require('../../models/Transaction');

module.exports = {
    session: (req, res) => {
        const params = req.query;

        if(!validQuery(req.path, params)) {
            return apiErr(res, 'ACCESS_DENIED');
        }

        getSessionAndPlayer(res, params)
            .then(result => {
                result = {
                    player: result.session.playerId,
                    currency: result.session.currency,
                    game: result.session.gameId
                }
                return res.status(200).json(result);
            })
            .catch(err => {
                console.log(err);
                return apiErr(res, 'INTERNAL_ERROR')
            });
    },
    balance: (req, res) => {
        const params = req.query;
    
        if(!validQuery(req.path, params)) {
            return apiErr(res, 'ACCESS_DENIED');
        }

        getSessionAndPlayer(res, params)
            .then(result => {
                const balance = getBalance(result.player, result.session.currency)
                
                result = {
                    balance: convertCredits.toEndorphina(balance)
                }
                return res.status(200).json(result);
            })
            .catch(err => {
                console.log(err);
                return apiErr(res, 'INTERNAL_ERROR')
            });
    },
    bet: (req, res) => {
        const params = req.body;
    
        if(!validQuery(req.path, params)) return apiErr(res, 'ACCESS_DENIED');

        Promise.all([getSessionAndPlayer(res, params), getTransaction(res, params)])
            .then(array => {
                let transaction = array[1];
                let getSessionAndPlayer = array[0];
                const session = getSessionAndPlayer.session;
                const player = getSessionAndPlayer.player;

                if (transaction) {
                    const result = {
                        transactionId: transaction.transactionId,
                        balance: convertCredits.toEndorphina(getBalance(player, session.currency))
                    }
                    return res.status(200).json(result);
                }

                
                const data = {
                    amount: convertCredits.toInternal(params.amount),
                    transactionId: randomstring.generate(32),
                    roundId: params.gameId,
                    type: 'bet',
                    status: 'success',
                    sessionId: session.sessionId,
                    providerTransactionId: params.id
                }
            
                let balance = getBalance(player, session.currency);
                
                if(balance < data.amount) {
                    return apiErr(res, 'INSUFFICIENT_FUNDS');
                } else {
                    balance -= data.amount;
                    db.save('transactions', data);
                    db.update('balance', { session, balance });

                    result = {
                        transactionId: data.transactionId,
                        balance: convertCredits.toEndorphina(balance)
                    }
                    return res.status(200).json(result);
                }
            })
            .catch(err => {
                
                console.log(err);
                return apiErr(res, 'INTERNAL_ERROR')
            });
    },
    refund: (req, res) => {
        const params = req.body;
    
        if(!validQuery(req.path, params)) return apiErr(res, 'ACCESS_DENIED');

        Promise.all([getSessionAndPlayer(res, params), getTransaction(res, params)])
            .then(array => {
                let transaction = array[1];
                let getSessionAndPlayer = array[0];
                const session = getSessionAndPlayer.session;
                const player = getSessionAndPlayer.player;

                if (transaction) {
                    const result = {
                        transactionId: transaction.transactionId,
                        balance: convertCredits.toEndorphina(getBalance(player, session.currency))
                    }
                    return res.status(200).json(result);
                }

                
                const data = {
                    amount: convertCredits.toInternal(params.amount),
                    transactionId: randomstring.generate(32),
                    roundId: params.gameId,
                    type: 'refund',
                    status: 'success',
                    sessionId: session.sessionId,
                    providerTransactionId: params.id,
                    providerBetTransactionId: params.bettransactionid,
                }
            
                let balance = getBalance(player, session.currency);
                
                if(balance < data.amount) {
                    return apiErr(res, 'INSUFFICIENT_FUNDS');
                } else {
                    balance += data.amount;
                    db.save('transactions', data);
                    db.update('balance', { session, balance });
                    db.update('betRefunded', data);

                    result = {
                        transactionId: data.transactionId,
                        balance: convertCredits.toEndorphina(balance)
                    }
                    return res.status(200).json(result);
                }
            })
            .catch(err => {
                
                console.log(err);
                return apiErr(res, 'INTERNAL_ERROR')
            });
    },
    win: (req, res) => {
        const params = req.body;
    
        if(!validQuery(req.path, params)) return apiErr(res, 'ACCESS_DENIED');

        Promise.all([getSessionAndPlayer(res, params), getTransaction(res, params)])
            .then(array => {
                let transaction = array[1];
                let getSessionAndPlayer = array[0];
                const session = getSessionAndPlayer.session;
                const player = getSessionAndPlayer.player;
                let balance = getBalance(player, session.currency);

                if (transaction) {
                    const result = {
                        transactionId: transaction.transactionId,
                        balance: convertCredits.toEndorphina(balance)
                    }
                    return res.status(200).json(result);
                }
             
                const data = {
                    amount: convertCredits.toInternal(params.amount),
                    transactionId: randomstring.generate(32),
                    roundId: params.gameId,
                    type: 'win',
                    status: 'success',
                    sessionId: session.sessionId,
                    providerTransactionId: params.id
                }
            
                if(balance < data.amount) {
                    return apiErr(res, 'INSUFFICIENT_FUNDS');
                } else {
                    balance += data.amount;
                    db.save('transactions', data);
                    db.update('balance', { session, balance });

                    result = {
                        transactionId: data.transactionId,
                        balance: convertCredits.toEndorphina(balance)
                    }
                    return res.status(200).json(result);
                }
            })
            .catch(err => {
                console.log(err)
                return apiErr(res, 'INTERNAL_ERROR')
            });
    }
}
