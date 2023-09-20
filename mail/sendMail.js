const {
    ReasonPhrases,
    StatusCodes,
    getReasonPhrase,
    getStatusCode, } = require('http-status-codes')
const sgMail = require('@sendgrid/mail')


// const nodemailer = require ('nodemailer')
require('dotenv').config()


async function sendMail(req, res,receiver,message,topic) {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: `${receiver}`, // Change to your recipient
            from: process.env.VERIFIED_EMAIL, // Change to your verified sender
            subject: `${topic}`,
            text: `${message}`
            // html: '<strong>Tell me when you receive this mail</strong>',
        };

        const info = await sgMail.send(msg);

        console.log('Email sent');
        res.json(info);
    } catch (error) {
        // console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: ReasonPhrases.INTERNAL_SERVER_ERROR });
    }
}






module.exports = {sendMail}