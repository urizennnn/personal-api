const sendEmail = require('./sendMail')

async function verificationEmail({ name, email, verificationtoken, origin }) {

    const verifyEmail = `${origin}/user/verify-email?token=${verificationEmail}&email=${email}`
    const message = `<p>Please verify your email by clicking this link <br> <a href="${verifyEmail}>Verify</a>"</p>`
    return sendEmail({
        to: email,
        subject: 'Email Confirmation',
        html: `<h3>Hello ${name}</h3> <br> ${message}`
    })
}

module.exports = verificationEmail