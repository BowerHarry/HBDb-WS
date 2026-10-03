// Returns the YouTube video id of the top search result for the film's trailer, or null.
async function findTrailer(user, film) {
    const year = new Date(film.release_date).getFullYear();
    const query = encodeURIComponent(`${film.title} ${year} trailer`);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${user.googleAPIKey}&part=snippet&type=video&maxResults=1&q=${query}`);
    if (!response.ok) {
        return null;
    }
    const json = await response.json();
    return json.items && json.items.length ? json.items[0].id.videoId : null;
}

module.exports = {
    findTrailer
};
