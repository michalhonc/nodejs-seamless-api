const express = require('express');
const router = express.Router();
const gameLaunch = require('../rest/endorphina/v1/gameLaunch');

router.get('/', (req, res) => {
    const launchURL = gameLaunch.real('test', 'common', 'admin', 'endorphina_Ninja@ENDORPHINA', 'EUR', 'https://example.com');
    res.send(launchURL);
})

module.exports = router;