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

// const nodemailer = require ('nodemailer')
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
  // const token = newUser.generateAuthToken();


  // Invoke the sendMail function with the required parameters
  // await sendMail(
  //   email,
  //   "You have successfully created an account on urizen's password manager",
  //   'User created'
  // );

  res.status(StatusCodes.CREATED).json({ newUser, token });
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
  sendMail(email, "You have successfully deleted your account from urizen's password manager", 'User Deleted')
  res.status(StatusCodes.OK).json({ message: "User deleted successfully." });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!password) {
    throw new CustomAPIErrorHandler(
      "Input your password",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
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
  existingUser.comparePassword(password)
  const tokenUser = ({ email: existingUser.email, UserId: existingUser._id })
  cookies({ res, user: tokenUser })
  throw new CustomAPIErrorHandler('Logged in ',StatusCodes.OK)
  // const token = existingUser.generateAuthToken()
  // sendMail(email, "You have just logged into your account on urizen's password manager", 'Login Alert')
  // res.status(StatusCodes.OK).json({ message: "Welcome back" ,token,user:existingUser.name});
};

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
  // sendMail(email, "You have successfully changed your password on account on urizen's password manager", 'Password Changed')
  await existingUser.save();

  res
    .status(StatusCodes.OK)
    .json({ message: "User information updated successfully." });
};


async function sendMail(req, res, receiver, message, topic) {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: `${receiver}`, // Change to your recipient
      from: process.env.VERIFIED_EMAIL, // Change to your verified sender
      subject: `${topic}`,
      text: `${message}`,
      // html: '<strong>Tell me when you receive this mail</strong>',
    };

    const info = await sgMail.send(msg);

    console.log("Email sent");
    res.json(info);
  } catch (error) {
    // console.error(error);
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: ReasonPhrases.INTERNAL_SERVER_ERROR });
  }
}





module.exports = {
  updateInfo,
  createUser,
  showUser,
  delUser,
  login,
  sendMail
};
