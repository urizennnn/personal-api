'use strict'
const jwt = require('jsonwebtoken');
const {
    ReasonPhrases,
    StatusCodes,
} = require('http-status-codes')

function createJWT({payload,res}){
    const token = jwt.sign(payload , process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_LIFETIME
    })
    return token
}

function verifyJWT({token}){
    const Usertoken = jwt.verify(token, process.env.JWT_SECRET)
    return Usertoken
}

function cookies({res,user}){
const token = createJWT({payload:user})
const timeLimit = 1000*60*60*24

res.cookie('token',token,{
    httpOnly:true,
    expires:new Date(Date.now()+timeLimit),
    secure:process.env.NODE_ENV ==='production',
    signed:true
})
    // res.status(StatusCodes.OK).json({user})

}
module.exports={
    createJWT,
    verifyJWT,
    cookies
}
