const nodemailer = require('nodemailer')
const settings = require('./nodemailerConfig')

async function sendMail({ to, subject, html }) {
    const testAccount = await nodemailer.createTestAccount()

    const transporter = nodemailer.createTransport(settings);

   return transporter.sendMail({
        from: '"Fred Foo 👻" <igamerryt@gmail.com>', // sender address
        to,
        subject,
        html

    })
}
module.exports = sendMail