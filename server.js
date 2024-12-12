// Environment variables
require('dotenv').config();

const express = require('express');
const {user} = require('./helper-functions');
const app = express();
app.use(express.urlencoded({extended: true}));

// Route methods
const { requestGetHandler, requestPostHandler } = require('./routes/request');
const { homeGetHandler } = require('./routes/home');
const { resetPostHandler, resetPasswordGetHandler, resetPasswordPostHandler } = require('./routes/password-reset');
const { userLoginPostHandler } = require('./routes/login');

// API methods
const {getUserByUsernamePassword} = require('./api/firestore');

// Home page
app.get('/', (req, res) => homeGetHandler(req, res, apiUser));

// Request access page
app.get('/request', requestGetHandler);
app.post('/request', requestPostHandler);

// Login auth
app.post('/login', userLoginPostHandler)
app.post('/reset', resetPostHandler);
app.get('/resetpassword', resetPasswordGetHandler);
app.post('/resetpassword', resetPasswordPostHandler);

// TMDb API
const {tmdbPostHandler, authKeyPostHandler} = require('./api/tmdb');
const {topMoviePostersPostHandler} = require('./api/tmdb/movies');

app.post('/tmdb', tmdbPostHandler);
app.post('/tmdb/auth', authKeyPostHandler);
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



