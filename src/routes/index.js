const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongodbHandle = require('./v1/dbHandler');
const keys = require('./config/keys');
const { getSign } = require('./v1/helpers');

router.post('/games', (req, res) => {
    const params = {
        currency: 'EUR',
        nodeId: keys.node.sid
    }
    const env = keys.endoURL.test;
    const sign = getSign(params);
    const url = `${env}/api/seamless/rest/v1/games?currency=${params.currency}&nodeId=${params.nodeId}&sign=${sign}`;
    let games;

    function getGames() {
        return new Promise((resolve, reject) => {
            axios.get(url)
                .then(response => {
                    resolve(response.data);
                })
                .catch(err => reject(err));
        });
    }

    getGames().then(data => {
            data.forEach(element => {
                let technology = [];
                let devices = [];
        
                element.tags.forEach(tag => {
                    if(tag === 'FLASH') {
                        technology.push(tag);
                        devices.push('desktop');
                    } else if (tag === 'HTML5') {
                        technology.push(tag);
                        devices.push('mobile');
                    } else {
                        return;
                    }
                });
                const game = {
                    provider: 'endorphina',
                    gameId: element.id,
                    technology: technology,
                    devices: devices,
                    img: `/public/src/img/${encodeURIComponent(element.id)}.png`,
                    tags: []
                }
                
                mongodbHandle.save('games', game);
            })
    })
            .then(data => {
                // mongodbHandle.save('games', game);
                console.log('hi', data);                
            })

});

router.get('/games', (req, res) => {
        mongodbHandle.find('games', res);
});

module.exports = router;