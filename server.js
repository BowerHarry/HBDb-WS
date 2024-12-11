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
const {getUserByUsernamePassword} = require('./api/firestore');

// Home page
app.get('/', (req, res) => homeGetHandler(req, res, apiUser));

// Request access page
app.get('/request', requestGetHandler);
app.post('/request', requestPostHandler);

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



