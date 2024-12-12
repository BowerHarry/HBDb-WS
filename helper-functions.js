const nodemailer = require("nodemailer");

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

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);                    
  
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
  
    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
  
class user {
    username;
    tmdbAPIKey;
    googleAPIKey;
    mdblistAPIKey;
    scrapenetworkAPIKey;
    active;

    constructor(json) {
        this.username = json.username;
        this.tmdbAPIKey = json.tmdbAPIKey;
        this.googleAPIKey = json.googleAPIKey;
        this.mdblistAPIKey = json.mdblistAPIKey;
        this.scrapenetworkAPIKey = json.scrapenetworkAPIKey;
        this.active = json.active;
    }
}

module.exports = {
    sha256,
    user,
    shuffleArray,
    sendEmail,
    rootUrl
};