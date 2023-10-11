'use strict'
const User = require("../models/users");
const Manager = require("../models/passwords");
const Token = require('../models/token');
const bcrypt = require("bcryptjs");
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require('http-status-codes');
const { cookies } = require('../utils/jwt');
const crypto = require('crypto');
const mail = require('../mail/index');
const {deleteToken} = require('./tokenDeletion')
require('dotenv').config();
const { getMac, createHash, createVerificationToken, generateRefreshToken } = require('./helper')
const origin = process.env.ORIGIN;




async function createUser(req, res) {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new CustomAPIErrorHandler("User already exists.", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const Device = getMac();
    const verificationToken = createVerificationToken();

    const newUser = await User.create({ email, password, verificationToken, Device });
    const tokenUser = { email: newUser.email, UserId: newUser._id };

    await mail.verificationEmail({ email: newUser.email, token: newUser.verificationToken, origin });

    res.status(StatusCodes.CREATED).json({ tokenUser });
  } catch (error) {
    throw new CustomAPIErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function showUser(req, res) {
  try {
    const data = await User.find({});
    console.log(req.user);
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    throw new CustomAPIErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function delUser(req, res) {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new CustomAPIErrorHandler("User not found", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    await Promise.all([
      User.deleteOne({ email }),
      Manager.deleteOne({ email }),
      mail.delete({ email: existingUser.email })
    ]);

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(Date.now())
    });

    res.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(Date.now())
    });

    res.status(StatusCodes.OK).json({ message: "User deleted successfully." });
  } catch (error) {
    throw new CustomAPIErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomAPIErrorHandler("Invalid Request", StatusCodes.UNAUTHORIZED);
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new CustomAPIErrorHandler("User not found", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
      throw new CustomAPIErrorHandler("Invalid password", StatusCodes.UNAUTHORIZED);
    }

    if (!existingUser.isVerified) {
      throw new CustomAPIErrorHandler('Please verify your email', StatusCodes.UNAUTHORIZED);
    }

    let deviceFound = false;
    const devices = existingUser.Device;
    const curDevice = getMac();

    devices.forEach((device) => {
      if (device === curDevice) {
        deviceFound = true;
        return;
      }
    });

    if (!deviceFound) await mail.loginAlert({ email: existingUser.email });

    const tokenUser = { email: existingUser.email, UserId: existingUser._id };
    let refreshToken;
    const existingToken = await Token.findOne({ user: existingUser._id });

    if (existingToken) {
      const { isValid } = existingToken;
      if (!isValid) {
        throw new CustomAPIErrorHandler('Invalid Credentials', StatusCodes.UNAUTHORIZED);
      }
      refreshToken = existingToken.refreshToken;
      cookies({ res, user: tokenUser, refreshToken });
      return res.status(StatusCodes.OK).json(tokenUser);
    }

    refreshToken = generateRefreshToken();
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    const userToken = { email, refreshToken, ip, userAgent, UserId: existingUser._id };

    await Token.create(userToken);
    cookies({ res, user: tokenUser, refreshToken });

    const UserPasswords = await Manager.findOne({ email });
    return res.status(StatusCodes.OK).json({ message: "Logged in", UserPasswords });
  } catch (error) {
    throw new CustomAPIErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function logout(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomAPIErrorHandler("Invalid Request", StatusCodes.UNAUTHORIZED);
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new CustomAPIErrorHandler("User not found", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
      throw new CustomAPIErrorHandler("Invalid password", StatusCodes.UNAUTHORIZED);
    }

    await deleteToken({ email })
    // Clear cookies
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(Date.now())
    });

    res.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(Date.now())
    });

    return res.status(StatusCodes.OK).json({ msg: `${email} logged out` });
  } catch (error) {
    throw new CustomAPIErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function updateInfo(req, res) {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new CustomAPIErrorHandler("User not found or invalid credentials", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    if (oldPassword && newPassword) {
      const isOldPassValid = await bcrypt.compare(oldPassword, existingUser.password);

      if (!isOldPassValid) {
        throw new CustomAPIErrorHandler("Invalid old password", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      existingUser.password = newPassword;
    } else {
      throw new CustomAPIErrorHandler("Both old password and new password are required.", StatusCodes.BAD_REQUEST);
    }

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(Date.now())
    });

    await existingUser.save();
    await mail.detailsUpdated({ email: existingUser.email });

    res.status(StatusCodes.OK).json({ message: "User information updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
}

async function verifyEmail(req, res) {
  try {
    const { verificationToken, email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      throw new CustomAPIErrorHandler('Verification failed', StatusCodes.UNAUTHORIZED)
    }
    if (user.verificationToken !== verificationToken) {
      throw new CustomAPIErrorHandler('Verification failed', StatusCodes.UNAUTHORIZED)
    }

    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = '';
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
  } catch (error) {
    throw new CustomAPIErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    throw new CustomAPIErrorHandler('Please provide email', StatusCodes.BAD_REQUEST)
  }
  const emailExist = await User.findOne({ email })
  if (emailExist) {
    const passToken = crypto.randomBytes(20).toString('hex')

    await mail.forgotPassword({ email: emailExist.email, token: passToken, origin })

    const time = 1000 * 60 * 15
    emailExist.passTokenExpiration = new Date(Date.now() + time)
    emailExist.passwordToken = createHash(passToken)
    await emailExist.save()
    res.status(StatusCodes.OK).json({ msg: 'Please check your email for verification link' })
  }
};

async function resetPassword(req, res) {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    throw new CustomAPIErrorHandler('Please provide all values', StatusCodes.BAD_REQUEST)
  }
  const user = await User.findOne({ email });
  if (user) {
    const curDate = new Date();
    if (user.passwordToken === createHash(token) && user.passTokenExpiration > curDate) {
      user.password = password;
      user.passwordToken = null;
      user.passTokenExpiration = null;
      await user.save();
      await mail.successMail({ email: user.email });
    }
  }
  res.status(StatusCodes.ACCEPTED).json({ msg: "Successful" });
};





module.exports = {
  createUser,
  showUser,
  delUser,
  login,
  verifyEmail,
  logout,
  updateInfo,
  forgotPassword,
  resetPassword,
};
