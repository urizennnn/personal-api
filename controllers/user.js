const User = require("../models/users");
const Manager = require("../models/passwords");
const bcrypt = require("bcrypt");
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require("http-status-codes");

const createUser = async (req, res) => {
  const existingUser = await User.findOne({ name: req.body.name });

  if (existingUser) {
    throw new CustomAPIErrorHandler(
      "User already exists.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const newUser = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ newUser });
};

const showUser = async (req, res) => {
  const data = await User.find({});
  res.status(StatusCodes.OK).json(data);
};

const delUser = async (req, res) => {
  const { name } = req.body;
  const existingUser = await User.findOne({ name });

  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User not found",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  await User.deleteOne({ name });
  await Manager.deleteOne({ user: name });

  res.status(StatusCodes.OK).json({ message: "User deleted successfully." });
};

const login = async (req, res) => {
  const { name, password } = req.body;
  if (!password) {
    throw new CustomAPIErrorHandler(
      "Input your password",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const existingUser = await User.findOne({ name });
  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User not found",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const pass = await bcrypt.compare(password, existingUser.password);
  if (!pass) {
    throw new CustomAPIErrorHandler(
      "Invalid Credentials",
      StatusCodes.UNAUTHORIZED
    );
  }
  res.status(StatusCodes.OK).json({ message: "Welcome back" });
};

const updateInfo = async (req, res) => {
  const { name, oldPassword, newPassword } = req.body;

  const existingUser = await User.findOne({ name });

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
};
