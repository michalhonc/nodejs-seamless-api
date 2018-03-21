const express = require('express');
const router = express.Router();

const seamless = require('./seamless');

router.get('/session', seamless.session);
router.get('/balance', seamless.balance);
router.post('/bet', seamless.bet);
router.post('/refund', seamless.refund);
router.post('/win', seamless.win);

module.exports = router;