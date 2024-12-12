const { getUserByUsernamePassword } = require('../api/firestore');

async function userLoginPostHandler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const username = req.body.username;
    const password = req.body.password;
    
    const authenticatedUser = await getUserByUsernamePassword(username, password);
    if (!authenticatedUser) {
        res.status(401).send('Invalid credentials');
        return;
    }
    res.json(authenticatedUser);
}

module.exports = {
    userLoginPostHandler
}; 