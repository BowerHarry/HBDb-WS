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

module.exports = {
    tmdbPostHandler: postRequestHandler,
    getConfiguration
};