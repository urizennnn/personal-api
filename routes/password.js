const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')
const {
  createPassword,
  addPassword,
  showPassword,
  deletePassword
} = require("../controllers/password");

router
  .post("/createPassword", auth,createPassword)
  .patch("/addPassword", auth, addPassword)
  .get("/showPass", showPassword)
  .delete ('/deletePassword', auth, deletePassword)

module.exports = router;
