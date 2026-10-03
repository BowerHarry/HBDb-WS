const { tmdb, getImageBaseUrl, toFilm } = require('../api/tmdb');
const { getRatings } = require('../api/mdblist');
const { findTrailer } = require('../api/youtube');

async function searchGetHandler(req, res) {
    const query = String(req.query.query || '').trim();
    if (!query) {
        return res.json({ results: [] });
    }

    const [search, imageBaseUrl] = await Promise.all([
        tmdb(req.user, `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`),
        getImageBaseUrl(req.user)
    ]);
    res.json({ results: search.results.map((film) => toFilm(film, imageBaseUrl)) });
}

// Everything the film page shows in one response: TMDb details, the user's own
// rating and watchlist state, ratings from other sites and a trailer.
async function filmGetHandler(req, res) {
    const id = req.params.id;
    const [film, states, imageBaseUrl] = await Promise.all([
        tmdb(req.user, `/movie/${id}?language=en-US`),
        tmdb(req.user, `/movie/${id}/account_states`),
        getImageBaseUrl(req.user)
    ]);
    // Ratings and trailer are extras: the page still works without them.
    const [ratings, trailer] = await Promise.all([
        film.imdb_id ? getRatings(req.user, film.imdb_id) : {},
        findTrailer(req.user, film).catch(() => null)
    ]);

    res.json({
        ...toFilm(film, imageBaseUrl),
        imdb_id: film.imdb_id,
        runtime: film.runtime,
        genres: film.genres.map((genre) => genre.name),
        user: {
            rating: states.rated ? states.rated.value : null,
            watchlist: states.watchlist
        },
        ratings: ratings,
        trailer: trailer
    });
}

async function similarGetHandler(req, res) {
    const [similar, imageBaseUrl] = await Promise.all([
        tmdb(req.user, `/movie/${req.params.id}/similar?language=en-US&page=1`),
        getImageBaseUrl(req.user)
    ]);
    const results = similar.results
        .filter((film) => film.poster_path)
        .sort((a, b) => b.popularity - a.popularity)
        .map((film) => toFilm(film, imageBaseUrl));
    res.json({ results: results });
}

// TMDb ratings run from 0.5 to 10 in steps of 0.5.
async function ratingPutHandler(req, res) {
    const value = req.body.value;
    if (typeof value !== 'number' || value < 0.5 || value > 10 || (value * 2) % 1 !== 0) {
        return res.sendStatus(400);
    }
    await tmdb(req.user, `/movie/${req.params.id}/rating`, { method: 'POST', body: { value: value } });
    res.sendStatus(204);
}

async function ratingDeleteHandler(req, res) {
    await tmdb(req.user, `/movie/${req.params.id}/rating`, { method: 'DELETE' });
    res.sendStatus(204);
}

module.exports = {
    searchGetHandler,
    filmGetHandler,
    similarGetHandler,
    ratingPutHandler,
    ratingDeleteHandler
};
