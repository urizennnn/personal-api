const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')

const {
  updateInfo,
  createUser,
  showUser,
  delUser,
  login,
  verifyEmail,
  logout,
  forgotPassword,
  resetPassword,
   showTokens,
   
} = require("../controllers/user");


router
  .route("/")
  .get(showUser)
  .post(createUser)
  .put(auth,updateInfo)
  .delete(auth,delUser);
router.post("/login", login);
router.delete('/logout',auth,logout)
router.post('/verify-email',verifyEmail)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password',resetPassword)
router.get('/showtoken',showTokens)

module.exports = router;
