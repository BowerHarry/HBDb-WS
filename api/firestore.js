const admin = require('firebase-admin');
const {user} = require('../helper-functions');

// Initialise firestore
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICEACCOUNT);
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
const db = admin.firestore();

// Methods
async function getUserByUsernamePassword(username, password) {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).where('password', '==', password).get();
    if (querySnapshot.empty) {
        return;
    }
    const authenticatedUser = new user(querySnapshot.docs[0].data());
    return authenticatedUser
}

// API
async function userLoginPostHandler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const user = await getUserByUsernamePassword(req.body.username, req.body.password)
    if (!user) {
        res.send(401);
    }
    else {
        res.send(user);
        
    }
    
}

module.exports = {
    getUserByUsernamePassword,
    userLoginPostHandler
};