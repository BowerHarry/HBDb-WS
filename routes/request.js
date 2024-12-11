const path = require('path');
const nodemailer = require("nodemailer");

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

function getRequestHandler(req, res) {
    res.sendFile(path.join(__dirname, '../views/form.html'));
}

async function postRequestHandler(req, res) {
    if (await sendEmail(process.env.EMAIL_USER, 'A new user has requested access to HBDb',
`Hi Harry,

A new user has requested access to HBDb.
    username: ${req.body.username}
    email: ${req.body.email}
    message: ${req.body.message}
`)) {
        res.send('Thanks for your request! We will get back to you shortly.');
    } else {
        res.send('Sorry your request has not been submitted. Get in contact with us via our GitHub page (https://github.com/BowerHarry/HBDb-WS).');
    }
}

module.exports = {
    requestGetHandler: getRequestHandler,
    requestPostHandler: postRequestHandler
};