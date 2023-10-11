'use strict'
const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')

const {
  updateInfo,
  createUser,
  delUser,
  login,
  verifyEmail,
  logout,
  forgotPassword,
  resetPassword,

} = require("../controllers/user");


router
  .route("/")
  .post(createUser)
  .put(auth, updateInfo)
  .delete(auth, delUser);
router.post("/login", login);
router.delete('/logout', auth, logout)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router;

