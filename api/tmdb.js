async function postRequestHandler(req, res) {
    console.log(req);
    res.send('Thanks for your request!');
}

async function getConfiguration(apiUser) {
    const url = 'https://api.themoviedb.org/3/configuration';
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apiUser.tmdbAPIKey}`
    }
    };

    const response = await fetch(url, options);
    const json = await response.json();
    return json
}

async function authKeyRequestHandler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const url = 'https://api.themoviedb.org/3/authentication';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${req.body.APIKey}`
        }
    };

    const response = await fetch(url, options);
    res.send(response.status)
}

module.exports = {
    tmdbPostHandler: postRequestHandler,
    getConfiguration,
    authKeyPostHandler: authKeyRequestHandler
};