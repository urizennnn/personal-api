const express = require("express");
const router = express.Router();
const {
  createPassword,
  updatePassword,
  showPassword,
} = require("../controllers/password");

router
  .post("/createPassword", createPassword)
  .patch("/updatePassword", updatePassword)
  .get("/showPass", showPassword);

module.exports = router;
