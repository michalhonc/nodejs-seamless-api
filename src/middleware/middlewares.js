const bodyParser = require('body-parser')
const morgan = require('morgan')
const logger = require('../logs/logger')

module.exports = (app) => {
    // Morgan
    // app.use(morgan("combined", { "stream": logger.stream }));

    // bodyParser
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json());
}