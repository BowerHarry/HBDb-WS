function getRequestHandler(req, res, apiUser) {
    res.send('Hello from App Engine!');
}

module.exports = {
    homeGetHandler: getRequestHandler,
};