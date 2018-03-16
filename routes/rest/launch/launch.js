const express = require('express');
const router = express.Router();
const logger = require('../../../logs/logger');

// Expecting /rest/launch/real-demo?provider=endorphina&currency=&game=
// SAFETY for player
let gameLaunch;
let launchURL;

router.get('/real', (req, res) => {
    logger.debug(req.query);
    try {gameLaunch = require(`../../rest/${req.query.provider}/v1/gameLaunch`)} 
    catch (error) {
        return res.send('Provider not found!')
    };

    const params = {
        env: 'test',
        node: 'common',
        playerid: 'admin',
        gameid: req.query.game,
        currency: 'EUR',
        exit: 'https://example.com'
    }

    launchURL = gameLaunch.real(params);    
    res.send(launchURL);
});

router.get('/demo', (req, res) => {
    try {gameLaunch = require(`../../rest/${req.query.provider}/v1/gameLaunch`)} 
    catch (error) {return res.send('Provider not found!')};

    const params = {
        game: req.query.game,
        exit: req.query.exit,
    }

    switch (req.query.provider) {
        case 'endorphina':
            gameLaunch.demo(params)
                .then(url => {
                    return res.send(url);
                })
                .catch(err => console.log('err', err));
            break;
        
        case 'other-provider':
            break;
    
        default:
            return res.send('Provider not found!');
            break;
    }
});

module.exports = router;