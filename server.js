// Environment variables
require('dotenv').config();

const express = require('express');
const {user} = require('./helper-functions');
const app = express();
app.use(express.urlencoded({extended: true}));

// Route methods
const { requestGetHandler, requestPostHandler } = require('./routes/request');
const { homeGetHandler } = require('./routes/home');

// API methods
const {getUserByUsernamePassword, userLoginPostHandler} = require('./api/firestore');

// Home page
app.get('/', (req, res) => homeGetHandler(req, res, apiUser));

// Request access page
app.get('/request', requestGetHandler);
app.post('/request', requestPostHandler);

// Login auth
app.post('/login', userLoginPostHandler)

// TMDb API
const {tmdbPostHandler} = require('./api/tmdb');
const {topMoviePostersPostHandler} = require('./api/tmdb/movies');

app.post('/tmdb', tmdbPostHandler);
app.post('/tmdb/movies/posters', (req, res) => topMoviePostersPostHandler(req, res, apiUser))

// Startup - API user fetched on startup. Once retrieved is accessible by all later processes.
async function onStartup() {
    apiUser = await getUserByUsernamePassword(process.env.API_USER, process.env.API_PASSWORD);
}
let apiUser;
onStartup();

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});



