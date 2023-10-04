'use strict'

const { verifyJWT } = require('../utils/jwt')
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require("http-status-codes");
const { cookies } = require('../utils/jwt')
const Token = require('../models/token')

async function auth(req, res, next) {
    try {
        const { accessToken, refreshToken } = req.signedCookies
        
        const payload = verifyJWT(refreshToken);
        if (!payload || !payload.user || !payload.user.UserId || !payload.refreshToken) {
            throw new CustomAPIErrorHandler('Invalid JWT payload', StatusCodes.UNAUTHORIZED);
        }

        const existing = await Token.findOne({
            UserId: payload.user.UserId,
            refreshToken: payload.refreshToken
        });

        if (!existing) {
            throw new CustomAPIErrorHandler('Not found', StatusCodes.UNAUTHORIZED);
        }

        cookies({ res, user: payload.user, refreshToken: existing.refreshToken })
        req.user = payload.user
        next()
    } catch (error) {
        return res.status(401).json({msg:error.message})
    }
}

module.exports = auth