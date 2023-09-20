const bcrypt = require("bcryptjs");
const { Schema, model } = require("mongoose");
const jwt = require('jsonwebtoken');
require('dotenv').config()
const userSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name."],
    },
    email: {
      type: String,
      required: [true, "Please provide a name."],
      unique:true
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // const user = this;
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ Userid: this._id, name: this.name },process.env.JWT_SECRET , { expiresIn: process.env.JWT_LIFETIME });
};

const User = model("User", userSchema);
module.exports = User;
