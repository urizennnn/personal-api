const bcrypt = require("bcryptjs");
const { Schema, model } = require("mongoose");
const jwt = require('jsonwebtoken');

const userSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name."],
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
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, name: this.name }, 'jwtSecret', { expiresIn: "24h" });
};

const User = model("User", userSchema);
module.exports = User;
