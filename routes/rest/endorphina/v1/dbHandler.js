const mongoose = require('mongoose');

// Load Model
const Session = require('../../../../models/Session');
const Player = require('../../../../models/Player');
const Transaction = require('../../../../models/Transaction');

const mongodbHandle = {
    save: function(collection, params) {
        switch (collection) {
            case 'transactions':
                new Transaction(params)
                    .save()
                    .then(transaction => {
                        return true;
                    })
                    .catch(err => {
                        console.log(err);
                        return err;
                    });
                break;
            
            case 'sessions':
                new Session(params)
                    .save()
                    .then(session => {
                        return true;
                    })
                    .catch(err => {
                        console.log(err);
                        return err;
                    });
                break;
            default:
                break;
        }
        return;
    },
    update: function(collection, params) {
        switch (collection) {
            case 'balance':
                Player.findOneAndUpdate({
                    playerId: params.globalSession.playerId,
                    'wallet.currency': params.globalSession.currency 
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
    findOne: function(collection, params) {
        
    }
}

module.exports = mongodbHandle;