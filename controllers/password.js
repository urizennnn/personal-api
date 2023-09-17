const User = require("../models/users");
const Manager = require("../models/passwords");
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require("http-status-codes");

const createPassword = async (req, res) => {
  const { user } = req.body;

  const existingUser = await User.findOne({ name: user });

  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User does not exist. Please create a user with this name and try again.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const existingManager = await Manager.findOne({ user: user });

  if (existingManager) {
    throw new CustomAPIErrorHandler(
      "Password manager already exists for this user. Proceed to update.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const newInput = await Manager.create(req.body);

  res.status(StatusCodes.CREATED).json(newInput);
};

const updatePassword = async (req, res) => {
  const { user, passManagerKey, passManagerValue } = req.body;

  const exist = User.find({ name: user });
  if (!exist) {
    throw new CustomAPIErrorHandler(
      "User does not exist please create an account and try again",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const updatedUser = await Manager.findOneAndUpdate(
    { user },
    { $set: { [`passManager.${passManagerKey}`]: passManagerValue } },
    { upsert: true, new: true }
  );

  res.status(StatusCodes.OK).json(updatedUser);
};

const showPassword = async (req, res) => {
  const data = await Manager.find({});
  res.status(StatusCodes.OK).json({ data });
};

module.exports = {
  createPassword,
  updatePassword,
  showPassword,
};
