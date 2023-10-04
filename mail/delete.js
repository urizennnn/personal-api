 'use strict'

const sgMail = require('@sendgrid/mail')
const fs = require('fs')


async function deleted({ email }) {
    const htmlMail = fs.readFileSync(__dirname + '/../html/delete.html', 'utf-8')
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: email,
            from: process.env.VERIFIED_EMAIL,
            subject: 'User Deleted Successfully',
            html: htmlMail
        };

        await sgMail.send(msg);

        console.log('Email sent');

    } catch (error) {
        console.error(error);

    }
}
module.exports = deleted;
