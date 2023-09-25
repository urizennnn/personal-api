'use strict'
const jwt = require('jsonwebtoken');
const {
    ReasonPhrases,
    StatusCodes,
} = require('http-status-codes')

function createJWT({ payload }) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    })
    return token
}

function verifyJWT( token ) {
    const Usertoken = jwt.verify(token, process.env.JWT_SECRET)
    return Usertoken
}

function cookies({ res, user,refreshtoken }) {
    const accessToken = createJWT({ payload: user })
    const refreshToken = createJWT({ payload: {user ,refreshtoken}})
    const timeLimit = 1000 * 60 * 60 * 24

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        maxAge:1000
    })
    res.cookie('refreshToken', refreshToken , {
        httpOnly: true,
        expires: new Date(Date.now() + timeLimit),
        secure: process.env.NODE_ENV === 'production',
        signed: true
    })
    // res.status(StatusCodes.OK).json({user})

}
module.exports = {
    createJWT,
    verifyJWT,
    cookies
}
