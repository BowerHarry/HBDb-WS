require('dotenv').config();
const express = require('express');
const path = require(`path`);
const app = express();
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



// This middleware is available in Express v4.16.0 onwards
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});

app.get('/request', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/form.html'));
  });

app.post('/request', async (req, res) => {
if(await sendEmail(process.env.EMAIL_USER, 'A new user has requested access to HBDb', 
`Hi Harry,

A new user has requested access to HBDb.
    username: ${req.body.username}
    email: ${req.body.email}
    message: ${req.body.message}
`)){
    res.send('Thanks for your request! We will get back to you shortly.');
}
else {
    res.send('Sorry your request has not been submitted. Get in contact with us via our GitHub page (https://github.com/BowerHarry/HBDb-WS).')
}
;
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});