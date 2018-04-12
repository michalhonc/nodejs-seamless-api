const express = require('express');
const router = express.Router();
const logger = require('../../logs/logger');

// Expecting /rest/launch/real-demo?provider=endorphina&currency=&game=
let gameLaunch;
let launchURL;

router.get('/real', (req, res) => {
    logger.debug(req.query);
    try {gameLaunch = require('../v1/gameLaunch')} 
    catch (error) {
        return res.send('Provider not found!')
    };

    const params = {
        env: 'test',
        node: 'common',
        playerid: 'admin',
        gameid: req.query.game,
        currency: req.query.currency,
        exit: 'https://example.com'
    }

    launchURL = gameLaunch.real(params);    
    res.send(launchURL);
});

router.get('/demo', (req, res) => {
    
});

module.exports = router;