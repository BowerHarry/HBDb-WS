// Origins allowed to call the service from a browser, comma separated.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://localhost:5173,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

function cors(req, res, next) {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
}

module.exports = {
    cors
};
