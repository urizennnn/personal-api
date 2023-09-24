const { verifyJWT } = require('../utils/jwt')
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require("http-status-codes");

function auth (req,res,next){
    const token = req.signedCookies.token

    if(!token){
        throw new CustomAPIErrorHandler('No token',StatusCodes.UNAUTHORIZED)
    }

    try {

        const {email,UserId} = verifyJWT({token})
        req.user={email,UserId}
        // console.log(req.user)
        next()

    } catch (error) {
        throw new CustomAPIErrorHandler('Authentication Required', StatusCodes.UNAUTHORIZED)
    }
}

module.exports = auth