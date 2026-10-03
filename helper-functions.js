const crypto = require('crypto');
const { promisify } = require('util');
const nodemailer = require("nodemailer");

const scrypt = promisify(crypto.scrypt);

const rootUrl = process.env.LIVE_MODE == "true" ? process.env.ROOT_URL : process.env.TEST_URL;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

async function sendEmail(email, subject, body) {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: body,
      }).catch(console.error);

      return info ? info.messageId : null;
}

function sha256(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
}

// Passwords are stored as "scrypt$<salt>$<hash>", salt and hash in hex.
async function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const hash = await scrypt(password, salt, 64);
    return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
    const [scheme, salt, hash] = String(storedHash).split('$');
    if (scheme !== 'scrypt' || !salt || !hash) {
        return false;
    }
    const expected = Buffer.from(hash, 'hex');
    const actual = await scrypt(password, Buffer.from(salt, 'hex'), expected.length);
    return crypto.timingSafeEqual(actual, expected);
}

// Accounts created before scrypt hold an unsalted SHA-256 hex digest.
function verifyLegacyPassword(password, storedDigest) {
    const expected = Buffer.from(String(storedDigest));
    const actual = Buffer.from(sha256(password));
    return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Express 4 doesn't catch rejected promises from async handlers.
function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

class user {
    id;
    username;
    email;
    active;
    passwordHash;
    legacyPassword;
    tmdbAPIKey;
    tmdbAccountId;
    googleAPIKey;
    mdblistAPIKey;

    constructor(id, json) {
        this.id = id;
        this.username = json.username;
        this.email = json.email;
        this.active = json.active;
        this.passwordHash = json.passwordHash;
        this.legacyPassword = json.password;
        this.tmdbAPIKey = json.tmdbAPIKey;
        this.tmdbAccountId = json.tmdbAccountId;
        this.googleAPIKey = json.googleAPIKey;
        this.mdblistAPIKey = json.mdblistAPIKey;
    }
}

module.exports = {
    sha256,
    hashPassword,
    verifyPassword,
    verifyLegacyPassword,
    user,
    shuffleArray,
    asyncHandler,
    sendEmail,
    rootUrl
};
