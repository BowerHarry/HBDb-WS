const TMDB_URL = 'https://api.themoviedb.org/3';

// Calls TMDb with the given user's key and returns the decoded JSON.
async function tmdb(user, path, { method = 'GET', body } = {}) {
    const options = {
        method: method,
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${user.tmdbAPIKey}`
        }
    };
    if (body) {
        options.headers['Content-Type'] = 'application/json;charset=utf-8';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(TMDB_URL + path, options);
    if (!response.ok) {
        const error = new Error(`TMDb ${method} ${path} failed with ${response.status}`);
        error.status = response.status === 404 ? 404 : 502;
        throw error;
    }
    return response.json();
}

// The image host comes from TMDb's configuration and rarely changes, so fetch it once.
let imageBaseUrl;
async function getImageBaseUrl(user) {
    if (!imageBaseUrl) {
        const config = await tmdb(user, '/configuration');
        imageBaseUrl = config.images.secure_base_url;
    }
    return imageBaseUrl;
}

// Watchlist and rating endpoints need the TMDb account id. Use the one on the
// user document if set, otherwise ask TMDb who the key belongs to.
const accountIds = new Map();
async function getAccountId(user) {
    if (user.tmdbAccountId) {
        return user.tmdbAccountId;
    }
    if (!accountIds.has(user.username)) {
        const account = await tmdb(user, '/account');
        accountIds.set(user.username, account.id);
    }
    return accountIds.get(user.username);
}

// The subset of a TMDb film the frontend uses, with a ready-made poster URL.
function toFilm(film, imageBaseUrl, posterSize = 'w342') {
    return {
        id: film.id,
        title: film.title,
        original_language: film.original_language,
        release_date: film.release_date,
        overview: film.overview,
        popularity: film.popularity,
        poster_url: film.poster_path ? imageBaseUrl + posterSize + film.poster_path : null
    };
}

module.exports = {
    tmdb,
    getImageBaseUrl,
    getAccountId,
    toFilm
};
