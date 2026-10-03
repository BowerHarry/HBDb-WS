const admin = require('firebase-admin');
const crypto = require('crypto');
const {user, sha256} = require('../helper-functions');

// Initialise firestore
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICEACCOUNT);
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
const db = admin.firestore();

// Users
async function getUserByUsername(username) {
    const querySnapshot = await db.collection('users').where('username', '==', username).limit(1).get();
    if (querySnapshot.empty) {
        return;
    }
    const doc = querySnapshot.docs[0];
    return new user(doc.id, doc.data());
}

async function getUsersByEmail(email) {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();
    return querySnapshot
}

// Stores the new hash and drops the legacy SHA-256 field if it is still there.
async function setUserPassword(userId, passwordHash) {
    await db.collection('users').doc(userId).update({
        passwordHash: passwordHash,
        password: admin.firestore.FieldValue.delete()
    });
}

// Sessions. Only the SHA-256 of the token is stored.
async function createSession(username) {
    const token = crypto.randomBytes(32).toString('hex');
    await db.collection('sessions').doc(sha256(token)).set({
        username: username,
        createdAt: admin.firestore.Timestamp.now()
    });
    return token;
}

async function getSession(tokenHash) {
    const doc = await db.collection('sessions').doc(tokenHash).get();
    return doc.exists ? doc.data() : null;
}

async function deleteSession(tokenHash) {
    await db.collection('sessions').doc(tokenHash).delete();
}

async function deleteSessionsForUser(username) {
    const querySnapshot = await db.collection('sessions').where('username', '==', username).get();
    await Promise.all(querySnapshot.docs.map((doc) => doc.ref.delete()));
}

// Password reset tokens
async function storeResetToken(email, token) {
    const tokenData = {
        email: email,
        token: sha256(token),
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

async function markTokenAsUsed(tokenId) {
    await db.collection('resetTokens').doc(tokenId).update({ used: true });
}

module.exports = {
    getUserByUsername,
    getUsersByEmail,
    setUserPassword,
    createSession,
    getSession,
    deleteSession,
    deleteSessionsForUser,
    storeResetToken,
    getResetToken,
    markTokenAsUsed
};
