'use strict'
const Token = require('../models/token');
const User = require("../models/users");
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require('http-status-codes');


async function deleteToken({ email }) {
    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const token = await Token.findOne({ email: existingUser.email });

            if (token) {
                await Token.deleteOne({ token: token.token });

            } 
        }
    } catch (error) {
       throw new CustomAPIErrorHandler(error.message,StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
module.exports = {deleteToken}