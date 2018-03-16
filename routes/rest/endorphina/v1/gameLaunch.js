const mongodbHandle = require('./dbHandler');
const keys = require('../config/keys');
const { generateUUID, getSign } = require('./helpers');
const axios = require('axios');
 
module.exports = {
    real: (args) => {
        // Check if arguments are present
        for (let key in args) {
            if (args.hasOwnProperty(key)) {
                if(args[key] === undefined){
                    return `Argument ${key} was not specified`;
                }
            }
        }

        let environment;
        if(args.env === 'test') environment = 'https://test.endorphina.com';
        else if (args.env === 'production') environment = 'https://cdn.endorphina.com';
        else return 'Incorrect environment';
        
        if(args.node === undefined) args.node = 'common';
        const nodeid = keys.node.sid;

        const token = generateUUID();

        const signQuery = {
            exit: args.exit,
            nodeid: nodeid,
            token: token,
            profile: 'nofullscreen.xml',
        }
        sign = getSign(signQuery);
        //launch URL
        const launchURL = `${environment}/api/sessions/seamless/rest/v1?exit=${encodeURI(args.exit)}&profile=nofullscreen.xml&nodeId=${nodeid}&token=${token}&sign=${sign}`;
           
        const params = {
            sessionId: token,
            playerId: args.playerid,
            currency: args.currency,
            gameId: args.gameid,
            active: true,
            node: args.node
        };
                
        mongodbHandle.save('sessions', params);
        return launchURL;
    },
    demo: (args) => {

        // TO DO
        // Add endorphina edemo launch URL mechanism
        return new Promise((resolve, reject) => {
            axios.get('https://endorphina-api.herokuapp.com/')
                .then(response => resolve(response.data))
                .catch(error => reject(err));
        });   
    }
}