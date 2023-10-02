const User = require("../models/users");
const Manager = require("../models/passwords");
const { CustomAPIErrorHandler } = require("../errors/custom-errors.js");
const { StatusCodes } = require("http-status-codes");

const createPassword = async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({email });

  if (!existingUser) {
    throw new CustomAPIErrorHandler(
      "User does not exist. Please create a user with this email and try again.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  const existingManager = await Manager.findOne({ email });

  // if (existingManager) {
  //   throw new CustomAPIErrorHandler(
  //     "Password manager already exists for this user. Proceed to update.",
  //     StatusCodes.INTERNAL_SERVER_ERROR
  //   );
  // }

  const newInput = await Manager.create(req.body);

  res.status(StatusCodes.CREATED).json(newInput);
};

const updatePassword = async (req, res) => {
  try {
    const { email, passManagerKey, passManagerValue } = req.body;
    const exists = await Manager.findOne({ email });

    if (!exists) {
      return res.status(404).json({ message: 'Please create a User or check the URL address and try again' });
    }

    // Update the specific key within the passManager object
    exists.passManager[passManagerKey] = passManagerValue;

    // Save the updated user
    const updatedUser = await exists.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    throw new CustomAPIErrorHandler(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
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
