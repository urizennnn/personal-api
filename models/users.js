const bcrypt = require("bcryptjs");
const { Schema, model } = require("mongoose");
require('dotenv').config()
const userSchema = Schema(
  {
    
    email: {
      type: String,
      required: [true, "Please provide an email."],
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



const User = model("User", userSchema);
module.exports = User;
