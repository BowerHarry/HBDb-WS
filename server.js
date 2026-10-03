// Environment variables
require('dotenv').config();

const express = require('express');
const { asyncHandler } = require('./helper-functions');
const { cors } = require('./middleware/cors');
const { requireSession } = require('./middleware/auth');

const app = express();
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Route methods
const { requestGetHandler, requestPostHandler } = require('./routes/request');
const { resetPostHandler, resetPasswordGetHandler, resetPasswordPostHandler } = require('./routes/password-reset');
const { userLoginPostHandler, userLogoutPostHandler } = require('./routes/login');

// Request access page
app.get('/request', requestGetHandler);
app.post('/request', asyncHandler(requestPostHandler));

// Login auth
app.post('/login', asyncHandler(userLoginPostHandler));
app.post('/logout', requireSession, asyncHandler(userLogoutPostHandler));
app.post('/reset', asyncHandler(resetPostHandler));
app.get('/resetpassword', asyncHandler(resetPasswordGetHandler));
app.post('/resetpassword', asyncHandler(resetPasswordPostHandler));

// Sign-in page posters (public)
const { postersGetHandler } = require('./routes/posters');
app.get('/api/posters', asyncHandler(postersGetHandler));

// Film API. Everything below needs a session; calls are made with the signed-in user's API keys.
const films = require('./routes/films');
const lists = require('./routes/lists');
const api = express.Router();
api.use(requireSession);
api.get('/films/search', asyncHandler(films.searchGetHandler));
api.get('/films/:id(\\d+)', asyncHandler(films.filmGetHandler));
api.get('/films/:id(\\d+)/similar', asyncHandler(films.similarGetHandler));
api.put('/films/:id(\\d+)/rating', asyncHandler(films.ratingPutHandler));
api.delete('/films/:id(\\d+)/rating', asyncHandler(films.ratingDeleteHandler));
api.get('/watchlist', asyncHandler(lists.watchlistGetHandler));
api.put('/watchlist/:id(\\d+)', asyncHandler(lists.watchlistPutHandler));
api.delete('/watchlist/:id(\\d+)', asyncHandler(lists.watchlistDeleteHandler));
api.get('/history', asyncHandler(lists.historyGetHandler));
app.use('/api', api);

// Anything a handler throws ends up here
app.use((error, req, res, next) => {
    console.error(error);
    res.sendStatus(error.status || 500);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
