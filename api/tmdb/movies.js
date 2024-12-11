const {getConfiguration} = require('../tmdb');
const {shuffleArray} = require('../../helper-functions');

async function topMoviePostersPostHandler(req, res, apiUser) {
    res.setHeader("Access-Control-Allow-Origin", "*");
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