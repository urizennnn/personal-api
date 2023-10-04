
 'use strict'
// const sendEmail = require('./sendMail');
const sgMail = require('@sendgrid/mail')
const fs = require('fs')


async function loginAlert({email}) {
   
    const html = fs.readFileSync(__dirname + '/../html/alert.html', 'utf-8');


   
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: process.env.VERIFIED_EMAIL,
            subject: 'New Login alert',
            html: html
        };

        await sgMail.send(msg);

        console.log('Email sent');

    } catch (error) {
        console.error(error);

    }
}
module.exports = loginAlert;
