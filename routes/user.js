const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')

const {
  updateInfo,
  createUser,
  showUser,
  delUser,
  login,
  logout
} = require("../controllers/user");

//Commented this part out because i felt it wasn't really nessecary
//because everthing could have been done on two different routes
//One with "/" and the other with "/login"
// router
//   .get("/showUser", showUser)
//   .post("/signup", createUser)
//   .put("/updateInfo", updateInfo)
//   .delete("/delUser", delUser)
//   .post("/login", login);

router
  .route("/")
  .get(showUser)
  .post(createUser)
  .put(auth,updateInfo)
  .delete(auth,delUser);
router.post("/login", login);
router.get('/logout',auth,logout)

module.exports = router;
