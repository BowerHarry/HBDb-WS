const path = require('path');
const {sendEmail} = require('../helper-functions');


function getRequestHandler(req, res) {
    res.sendFile(path.join(__dirname, '../views/form.html'));
}


async function postRequestHandler(req, res) {
    if (await sendEmail(process.env.EMAIL_USER, 'A new user has requested access to HBDb',
`Hi Harry,

A new user has requested access to HBDb.
    username: ${req.body.username}
    email: ${req.body.email}
    message: ${req.body.message}
`)) {
        res.send('Thanks for your request! We will get back to you shortly.');
    } else {
        res.send('Sorry your request has not been submitted. Get in contact with us via our GitHub page (https://github.com/BowerHarry/HBDb-WS).');
    }
}

module.exports = {
    requestGetHandler: getRequestHandler,
    requestPostHandler: postRequestHandler,
    sendEmail
};