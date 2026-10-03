const PROVIDERS = ['imdb', 'letterboxd', 'tomatoes'];

async function getRating(user, imdbId, provider) {
    const response = await fetch(`https://mdblist.com/api/rating/movie/${provider}?apikey=${user.mdblistAPIKey}`, {
        method: 'POST',
        body: JSON.stringify({ids: [imdbId], provider: 'imdb'})
    });
    const json = await response.json();
    return json.rating[imdbId];
}

// Returns {imdb, letterboxd, tomatoes}; a rating that can't be fetched is null.
async function getRatings(user, imdbId) {
    const ratings = {};
    await Promise.all(PROVIDERS.map(async (provider) => {
        ratings[provider] = await getRating(user, imdbId, provider).catch(() => null) ?? null;
    }));
    return ratings;
}

module.exports = {
    getRatings
};
