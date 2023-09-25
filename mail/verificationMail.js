const sendEmail = require('./sendMail');

async function verificationEmail({ email, verificationtoken, origin }) {

    const verifyEmail = `${origin}/user/verify-email?token=${verificationEmail}&email=${email}`;
    const message = `<p>Please verify your email by clicking this link <br> <a href="${verifyEmail}">Verify</a></p>`;


    await sendEmail({
        to: email,
        subject: 'Email Confirmation',
        html: `<h3>Hello ${email}</h3> <br> ${message}`
    });
}

module.exports = verificationEmail;
