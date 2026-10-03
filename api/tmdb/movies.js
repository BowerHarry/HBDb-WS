const {getConfiguration} = require('../tmdb');
const {shuffleArray} = require('../../helper-functions');
const {getUserByUsername} = require('../firestore');

// The login page's posters are fetched with a designated account's TMDb key.
let apiUser;
async function getApiUser() {
    if (!apiUser) {
        apiUser = await getUserByUsername(process.env.API_USER);
    }
    return apiUser;
}

async function topMoviePostersPostHandler(req, res) {
    const apiUser = await getApiUser();
    if (!apiUser) {
        return res.sendStatus(503);
    }
    const config = await getConfiguration(apiUser)
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${apiUser.tmdbAPIKey}`
        }
    };

    var posterArray = []
    const response = await fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options)
    const json = await response.json()
    for (const movie in json.results) {
        posterArray.push( config.images.base_url + 'w780' + json.results[movie].poster_path);
    }
    shuffleArray(posterArray)
    res.send(posterArray);
}

module.exports = {
    topMoviePostersPostHandler
};