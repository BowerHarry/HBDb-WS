const { tmdb, getImageBaseUrl, getAccountId, toFilm } = require('../api/tmdb');

// List endpoints don't include runtimes, so look each film up.
async function withRuntimes(user, films) {
    return Promise.all(films.map(async (film) => {
        const details = await tmdb(user, `/movie/${film.id}?language=en-US`);
        return { ...film, runtime: details.runtime };
    }));
}

async function watchlistGetHandler(req, res) {
    const [accountId, imageBaseUrl] = await Promise.all([getAccountId(req.user), getImageBaseUrl(req.user)]);
    const list = await tmdb(req.user, `/account/${accountId}/watchlist/movies?language=en-US&page=1&sort_by=created_at.asc`);
    const films = list.results.map((film) => toFilm(film, imageBaseUrl));
    res.json({ results: await withRuntimes(req.user, films) });
}

async function setWatchlist(req, res, watchlist) {
    const accountId = await getAccountId(req.user);
    await tmdb(req.user, `/account/${accountId}/watchlist`, {
        method: 'POST',
        body: { media_type: 'movie', media_id: Number(req.params.id), watchlist: watchlist }
    });
    res.sendStatus(204);
}

// Films the user has rated, each with the rating they gave it.
async function historyGetHandler(req, res) {
    const [accountId, imageBaseUrl] = await Promise.all([getAccountId(req.user), getImageBaseUrl(req.user)]);
    const list = await tmdb(req.user, `/account/${accountId}/rated/movies?language=en-US&page=1&sort_by=created_at.asc`);
    const films = list.results.map((film) => ({ ...toFilm(film, imageBaseUrl), rating: film.rating }));
    res.json({ results: await withRuntimes(req.user, films) });
}

module.exports = {
    watchlistGetHandler,
    watchlistPutHandler: (req, res) => setWatchlist(req, res, true),
    watchlistDeleteHandler: (req, res) => setWatchlist(req, res, false),
    historyGetHandler
};
