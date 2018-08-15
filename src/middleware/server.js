module.exports = (app) => {
    app.disable('x-powered-by')
    app.disable('etag')
}