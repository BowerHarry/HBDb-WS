const { getSession, getUserByUsername } = require('../api/firestore');
const { sha256, asyncHandler } = require('../helper-functions');

const SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const CACHE_LIFETIME_MS = 5 * 60 * 1000;

// Verified sessions are remembered briefly to avoid two Firestore reads per request.
const cache = new Map();

async function loadSession(tokenHash) {
    const session = await getSession(tokenHash);
    if (!session) {
        return null;
    }
    const age = Date.now() / 1000 - session.createdAt.seconds;
    if (age > SESSION_LIFETIME_SECONDS) {
        return null;
    }
    const sessionUser = await getUserByUsername(session.username);
    return sessionUser && sessionUser.active ? sessionUser : null;
}

// Requires "Authorization: Bearer <token>" and sets req.user and req.tokenHash.
const requireSession = asyncHandler(async (req, res, next) => {
    const match = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    if (!match) {
        return res.sendStatus(401);
    }

    const tokenHash = sha256(match[1]);
    let entry = cache.get(tokenHash);
    if (!entry || entry.expires < Date.now()) {
        const sessionUser = await loadSession(tokenHash);
        if (!sessionUser) {
            cache.delete(tokenHash);
            return res.sendStatus(401);
        }
        entry = { user: sessionUser, expires: Date.now() + CACHE_LIFETIME_MS };
        cache.set(tokenHash, entry);
    }

    req.user = entry.user;
    req.tokenHash = tokenHash;
    next();
});

function forgetSession(tokenHash) {
    cache.delete(tokenHash);
}

function forgetUser(username) {
    for (const [tokenHash, entry] of cache) {
        if (entry.user.username === username) {
            cache.delete(tokenHash);
        }
    }
}

module.exports = {
    requireSession,
    forgetSession,
    forgetUser
};
