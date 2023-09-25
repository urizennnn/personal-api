const { verifyJWT } = require('../utils/jwt')
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require("http-status-codes");
const { cookies } = require('../utils/jwt')
const Token = require('../models/token')

async function auth(req, res, next) {
    try {
        const { accessToken, refreshToken } = req.signedCookies
        if (accessToken) {
            const payload = verifyJWT(accessToken)
            req.user = payload.user
            return next()
        }
        const payload = verifyJWT(refreshToken)
        const existing = await Token.findOne({
            user: payload.user.UserId,
            refreshToken: payload.refreshToken
        })

        if (!existing || !existing?.isValid) {
            throw new CustomAPIErrorHandler('Authentication Required', StatusCodes.UNAUTHORIZED)

        }
        cookies({ res, user: payload.user, refreshToken: existing.refreshToken })
        req.user = payload.user
        next()
    } catch (error) {
        throw new CustomAPIErrorHandler('Authentication Required', StatusCodes.UNAUTHORIZED)
    }
}

module.exports = auth