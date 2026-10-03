const { getUserByUsername, setUserPassword, createSession, deleteSession } = require('../api/firestore');
const { hashPassword, verifyPassword, verifyLegacyPassword } = require('../helper-functions');
const { forgetSession } = require('../middleware/auth');

async function checkPassword(account, password) {
    if (account.passwordHash) {
        return verifyPassword(password, account.passwordHash);
    }
    if (account.legacyPassword && verifyLegacyPassword(password, account.legacyPassword)) {
        // First sign-in since the move to scrypt: upgrade the stored hash.
        await setUserPassword(account.id, await hashPassword(password));
        return true;
    }
    return false;
}

async function userLoginPostHandler(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.sendStatus(400);
    }

    const account = await getUserByUsername(username);
    if (!account || !(await checkPassword(account, password))) {
        return res.status(401).send('Invalid credentials');
    }
    if (!account.active) {
        return res.status(403).send('Account is not active');
    }

    const token = await createSession(account.username);
    res.json({ token: token, username: account.username });
}

async function userLogoutPostHandler(req, res) {
    await deleteSession(req.tokenHash);
    forgetSession(req.tokenHash);
    res.sendStatus(204);
}

module.exports = {
    userLoginPostHandler,
    userLogoutPostHandler
};
