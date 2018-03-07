const mongodbHandle = require('./dbHandler');
const keys = require('../../../../config/keys');
const { generateUUID, getSign } = require('./helpers');

module.exports = {
    real: (env, node, playerid, gameid, currency, exit) => {
        //env
        let environment;
        if(env === 'test') environment = 'https://test.endorphina.com';
        else if (env === 'production') environment = 'https://cdn.endorphina.com';
        else return console.log('Incorrect environment');
        //nodeid
        if(node === null) node = 'common';
        const nodeid = keys.node.sid;
        console.log('nodeid', nodeid);
        //token
        const token = generateUUID();
        //sign
        const signQuery = {
            exit: exit,
            nodeid: nodeid,
            token: token,
            profile: 'nofullscreen.xml',
        }
        sign = getSign(signQuery);
        //launch URL
        let launchURL = `${environment}/api/sessions/seamless/rest/v1?exit=${encodeURI(exit)}&profile=nofullscreen.xml&nodeId=${nodeid}&token=${token}&sign=${sign}`;
           
        const params = {
            sessionId: token,
            playerId: playerid,
            currency: currency,
            gameId: gameid,
            active: true,
            node: node
        };
        mongodbHandle.save('sessions', params);
        return launchURL;
    },
    demo: () => {

    }
}