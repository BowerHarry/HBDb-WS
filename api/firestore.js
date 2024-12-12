const admin = require('firebase-admin');
const path = require('path');
const {user} = require('../helper-functions');
const crypto = require('crypto');

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

async function getUsersByEmail(email) {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();
    return querySnapshot
}

async function storeResetToken(email, token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = {
        email: email,
        token: hashedToken,
        createdAt: admin.firestore.Timestamp.now(),
        used: false
    };
    
    const docRef = await db.collection('resetTokens').add(tokenData);
    return docRef.id;
}

async function getResetToken(hashedToken) {
    const tokensRef = db.collection('resetTokens');
    const querySnapshot = await tokensRef
        .where('token', '==', hashedToken)
        .where('used', '==', false)
        .get();
    
    if (querySnapshot.empty) {
        return null;
    }
    
    const tokenDoc = querySnapshot.docs[0];
    return {
        ...tokenDoc.data(),
        id: tokenDoc.id
    };
}

async function updateUserPassword(email, hashedPassword) {
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();
    const userDoc = userSnapshot.docs[0];
    await userDoc.ref.update({ password: hashedPassword });
}

async function markTokenAsUsed(tokenId) {
    await db.collection('resetTokens').doc(tokenId).update({ used: true });
}

module.exports = {
    getUserByUsernamePassword,
    getUsersByEmail,
    storeResetToken,
    getResetToken,
    updateUserPassword,
    markTokenAsUsed
};