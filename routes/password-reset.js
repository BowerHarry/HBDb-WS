const path = require('path');
const crypto = require('crypto');
const { getUsersByEmail, storeResetToken, getResetToken, updateUserPassword, markTokenAsUsed } = require('../api/firestore');
const { sendEmail, rootUrl } = require('../helper-functions');

function generateResetToken() {
    return crypto.randomBytes(12).toString('hex'); // 24 character hex string
}

async function verifyResetToken(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = await getResetToken(hashedToken);
    
    if (!tokenData) {
        return null;
    }
    
    // Check if token is expired (24 hours)
    const now = Date.now() / 1000; // Convert to seconds
    const tokenAge = now - tokenData.createdAt.seconds;
    if (tokenAge > 86400) { // 24 hours in seconds
        return null;
    }
    
    return {
        email: tokenData.email,
        tokenId: tokenData.id
    };
}

async function resetPostHandler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    const users = await getUsersByEmail(req.body.email)
    if (users.empty || users.docs.length > 1) {
        res.sendStatus(users.empty ? 401 : 403);
    }
    else {
        const user = users.docs[0].data();
        const email = user.email;
        const token = generateResetToken();
        
        try {
            await storeResetToken(email, token);
            const subject = 'HBDb - Reset your password';
            const resetLink = `${rootUrl}/resetpassword?token=${token}`;
            const body = `Click the link to reset your HBDb password: ${resetLink}`;
            
            await sendEmail(email, subject, body);
            res.sendStatus(200);
        } catch (error) {
            console.error('Reset password error:', error);
            res.sendStatus(500);
        }
    }
}

async function resetPasswordGetHandler(req, res) {
    const token = req.query.token;
    if (!token) {
        return res.sendStatus(400);
    }
    
    const tokenData = await verifyResetToken(token);
    if (!tokenData) {
        return res.sendStatus(401);
    }
    
    res.sendFile(path.join(__dirname, '../views/reset.html'));
}

async function resetPasswordPostHandler(req, res) {
    const { token, password, passwordConfirm } = req.body;
    
    if (!token || !password || password !== passwordConfirm) {
        return res.sendStatus(400);
    }
    
    const tokenData = await verifyResetToken(token);
    if (!tokenData) {
        return res.sendStatus(401);
    }
    
    try {
        // Hash the new password before storing
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        await updateUserPassword(tokenData.email, hashedPassword);
        await markTokenAsUsed(tokenData.tokenId);
        
        const subject = 'HBDb - Your password has been reset';
        const body = `Your password has been reset. If you did not request this, please contact support.`;
            
        await sendEmail(tokenData.email, subject, body);
        res.send("Password reset successful");
    } catch (error) {
        console.error('Reset password error:', error);
        res.send("Password reset failed");
    }
}

module.exports = {
    resetPostHandler,
    resetPasswordGetHandler,
    resetPasswordPostHandler
}; 