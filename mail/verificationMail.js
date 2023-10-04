// const sendEmail = require('./sendMail');
'use strict'

const sgMail = require('@sendgrid/mail')
const fs = require('fs')


async function verificationEmail({ email, origin, token }) {
    const verifyEmail = `${origin}/user/verify-email?token=${token}&email=${email}`;
    const html = fs.readFileSync(__dirname + '/../html/verification.html', 'utf-8')
    const htmlMail = html.replace('${verifyEmail}', verifyEmail)
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: process.env.VERIFIED_EMAIL,
            subject: 'Verify Your Email',
            html: htmlMail
        };

        await sgMail.send(msg);

        console.log('Email sent');

    } catch (error) {
        console.error(error);

    }
}
module.exports = verificationEmail;
