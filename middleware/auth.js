const jwt = require('jsonwebtoken')
const User = require('../models/users')
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require("http-status-codes");

function auth (req,res,next){
    const authHeader =req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new CustomAPIErrorHandler('Authenticaion Invalid',StatusCodes.BAD_REQUEST)
    }
    const token = authHeader.split('')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {Userid:payload.userId}
        next()
    } catch (error) {
        throw new CustomAPIErrorHandler('Internal Server Error',StatusCodes.BAD_REQUEST)
    }
}

module.exports = auth