const User = require("../models/users");
const Manager = require("../models/passwords");
const Token = require('../models/token');
const bcrypt = require("bcryptjs");
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { ReasonPhrases, StatusCodes } = require('http-status-codes');
const sgMail = require('@sendgrid/mail');
const { cookies } = require('../utils/jwt');
const crypto = require('crypto');
const verificationMail = require("../mail/verificationMail");
require('dotenv').config();

const createVerificationToken = () => crypto.randomBytes(40).toString('hex');

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

const createUser = async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomAPIErrorHandler("User already exists.", StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const origin = 'http://localhost:3000';
  const verificationToken = createVerificationToken();
  const newUser = await User.create({ email, password, verificationToken });
  const tokenUser = { email: newUser.email, UserId: newUser._id };

  // await verificationMail({ email: newUser.email, verificationtoken: newUser.verificationToken, origin });
  res.status(StatusCodes.CREATED).json({ newUser, tokenUser });
};

const showUser = async (req, res) => {
  const data = await User.find({});
  console.log(req.user);
  res.status(StatusCodes.OK).json(data);
};

const delUser = async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new CustomAPIErrorHandler("User not found", StatusCodes.INTERNAL_SERVER_ERROR);
  }

  await Promise.all([
    User.deleteOne({ email }),
    Manager.deleteOne({ email })
  ]);

  res.status(StatusCodes.OK).json({ message: "User deleted successfully." });
};

const login = async (req, res) => {
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
    const userToken = { refreshToken, ip, userAgent, UserId: existingUser._id };

    await Token.create(userToken);
    cookies({ res, user: tokenUser, refreshToken });

    const UserPasswords = await Manager.findOne({ email });
    return res.status(StatusCodes.OK).json({ message: "Logged in", UserPasswords });
  } catch (error) {
    throw new CustomAPIErrorHandler('Something went wrong', error);
    // console.error(error);
  }
};

const logout = async (req, res) => {
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

    const { UserId } = req.user;

    await Token.findOneAndDelete({ user: UserId });

    // Clear cookies
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(Date.now())
    });
    res.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(Date.now())
    });

    return res.status(StatusCodes.OK).json({ msg: `${UserId} logged out` });
  } catch (error) {
    throw new CustomAPIErrorHandler('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const updateInfo = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new CustomAPIErrorHandler("User not found", StatusCodes.INTERNAL_SERVER_ERROR);
  }

  if (oldPassword && newPassword) {
    const isOldPassValid = await bcrypt.compare(oldPassword, existingUser.password);

    if (!isOldPassValid) {
      throw new CustomAPIErrorHandler("Invalid old password", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    existingUser.password = hashedPassword;
  } else {
    throw new CustomAPIErrorHandler("Both old password and new password are required.", StatusCodes.BAD_REQUEST);
  }
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(Date.now())
  })
  await existingUser.save();

  res.status(StatusCodes.OK).json({ message: "User information updated successfully." });
};

const verifyEmail = async (req, res) => {
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
    throw new CustomAPIErrorHandler("Internal Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  updateInfo,
  createUser,
  showUser,
  delUser,
  login,
  verifyEmail,
  logout
};
