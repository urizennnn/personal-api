// const sendEmail = require('./sendMail');
const sgMail = require('@sendgrid/mail')
const fs = require('fs')


async function forgotPassword({ email, origin, token }) {
    const URL = `${origin}/user/forgot-password?token=${token}&email=${email}`;
     const html = fs.readFileSync(__dirname + '/../html/reset.html', 'utf-8');


    // Replace the placeholder with the verification URL
    const htmlEmail = html.replace('${verifyEmail}', URL);
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: process.env.VERIFIED_EMAIL,
            subject: 'Forgot password',
            html: htmlEmail
        };

        await sgMail.send(msg);

        console.log('Email sent');

    } catch (error) {
        console.error(error);

    }
}
module.exports = forgotPassword;
