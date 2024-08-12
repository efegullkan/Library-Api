const nodemailer = require("nodemailer");
const config = require("config");
const email = config.get("email.mail");
const password = config.get("email.password");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: password
    }
});

module.exports = transporter;