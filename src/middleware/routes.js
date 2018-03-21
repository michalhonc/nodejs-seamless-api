// Load routes
const endorphinaSeamless = require('../routes/v1/routes');
const launch = require('../routes/launch/launch');

module.exports = (app, express) => {
    // Use Routes
    app.use('/rest/launch', launch)
    app.use('/rest/endorphina/v1', endorphinaSeamless)
    app.use('/public/src/img',express.static(__dirname + '/public/src/img'))    
}
