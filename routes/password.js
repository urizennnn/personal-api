const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')
const {
  createPassword,
  updatePassword,
  showPassword,
} = require("../controllers/password");

router
  .post("/createPassword", auth,createPassword)
  .patch("/updatePassword",auth, updatePassword)
  .get("/showPass", showPassword);

module.exports = router;
