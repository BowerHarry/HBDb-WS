const admin = require('firebase-admin');
const {user} = require('../helper-functions');

// 


// Initialise firestore
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICEACCOUNT);
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
const db = admin.firestore();

// Methods
async function getUserByUsernamePassword(username, password) {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).where('password', '==', password).get();
    if (querySnapshot.empty) {
        console.log('No matching user.');
        return;
    }
    const apiUser = new user(querySnapshot.docs[0].data());
    return apiUser
}

module.exports = {
    getUserByUsernamePassword,
};