const { tmdb, getImageBaseUrl } = require('../api/tmdb');
const { getUserByUsername } = require('../api/firestore');
const { shuffleArray } = require('../helper-functions');

// The sign-in page's posters are public, so they are fetched with a designated account's TMDb key.
let apiUser;
async function getApiUser() {
    if (!apiUser) {
        apiUser = await getUserByUsername(process.env.API_USER);
    }
    return apiUser;
}

async function postersGetHandler(req, res) {
    const user = await getApiUser();
    if (!user) {
        return res.sendStatus(503);
    }

    const [popular, imageBaseUrl] = await Promise.all([
        tmdb(user, '/movie/popular?language=en-US&page=1'),
        getImageBaseUrl(user)
    ]);
    const posters = popular.results
        .filter((film) => film.poster_path)
        .map((film) => imageBaseUrl + 'w780' + film.poster_path);
    shuffleArray(posters);
    res.json(posters);
}

module.exports = {
    postersGetHandler
};
