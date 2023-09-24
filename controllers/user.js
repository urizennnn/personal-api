const User = require("../models/users");
const Manager = require("../models/passwords");
const bcrypt = require("bcryptjs");
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const {
  ReasonPhrases,
  StatusCodes,
  } = require('http-status-codes')
const sgMail = require('@sendgrid/mail')
const {cookies} = require('../utils/jwt')

require('dotenv').config()


const createUser = async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
const {email,password} = req.body
  if (existingUser) {
    throw new CustomAPIErrorHandler(
      "User already exists.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
  const newUser = await User.create({email,password});
  const tokenUser = ({email:newUser.email,UserId:newUser._id})
  cookies({res,user:tokenUser})
  

  res.status(StatusCodes.CREATED).json({ newUser, tokenUser });
};

const showUser = async (req, res) => {
  const data = await User.find({});
  console.log(req.signedCookies)

  res.status(StatusCodes.OK).json(data);
};


const delUser = async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User not found",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  await User.deleteOne({ email });
  await Manager.deleteOne({ email});
  res.status(StatusCodes.OK).json({ message: "User deleted successfully." });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  if(!email || !password){
     throw new CustomAPIErrorHandler("Invalid Request",StatusCodes.UNAUTHORIZED)
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User not found",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
  const isPasswordCorrect = await bcrypt.compare(password,existingUser.password)
  if(!isPasswordCorrect){
    throw new CustomAPIErrorHandler("Invalid password",StatusCodes.UNAUTHORIZED)
  }
  
  const tokenUser = ({ email: existingUser.email, UserId: existingUser._id })
  cookies({ res, user: tokenUser })//generates jwt token
  const UserPasswords = await Manager.findOne({email})
  return res.status(StatusCodes.OK).json({ message: "Logged in" ,UserPasswords});
};

async function logout(req,res){
  const {email,password} = req.body

  if (!email || !password) {
    throw new CustomAPIErrorHandler("Invalid Request", StatusCodes.UNAUTHORIZED)
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User not found",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
  const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
  if (!isPasswordCorrect) {
    throw new CustomAPIErrorHandler("Invalid password", StatusCodes.UNAUTHORIZED)
  }
  const {UserId} = req.user
res.cookie('token','',{
  httpOnly: true,
  expires: new Date(Date.now())
})
throw new CustomAPIErrorHandler(`${UserId} logged out`,StatusCodes.OK)
}

const updateInfo = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User not found",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  if (oldPassword && newPassword) {
    const isOldPassValid = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );

    if (!isOldPassValid) {
      throw new CustomAPIErrorHandler(
        "Invalid old password",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    existingUser.password = hashedPassword;
  } else {
    throw new CustomAPIErrorHandler(
      "Both old password and new password are required.",
      StatusCodes.BAD_REQUEST
    );
  }
  await existingUser.save();

  res
    .status(StatusCodes.OK)
    .json({ message: "User information updated successfully." });
};








module.exports = {
  updateInfo,
  createUser,
  showUser,
  delUser,
  login,
  logout
};
