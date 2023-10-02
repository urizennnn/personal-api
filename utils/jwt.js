'use strict'
const jwt = require('jsonwebtoken');


function createJWT({ payload }) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn:'1h'
    })
    return token
}

function verifyJWT( token ) {
    const Usertoken = jwt.verify(token, process.env.JWT_SECRET)
    return Usertoken
}

function cookies({ res, user,refreshToken }) {
    const accessTokenJWT = createJWT({ payload: user })
    const refreshTokenJWT = createJWT({ payload: {user ,refreshToken}})
    const timeLimit = 1000 * 60 * 60 * 24

    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        maxAge:1000
    })
    res.cookie('refreshToken', refreshTokenJWT , {
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
