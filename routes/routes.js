const express = require('express');
const router = express.Router();
const { createUser,
    createPassword,
    updateInfo,
    updatePassword,
    showPassword,
    showUser,
    delUser,
    login } = require('../controllers/functions')
router.get('/', (req, res) => {
    res.send('Hello')
})
router.route('/signUp').post(createUser)


router.route('/createPassword').post(createPassword)
router.route('/updatePassword').patch(updatePassword)
router.route('/showUser').get(showUser)
router.route('/showPass').get(showPassword)
router.route('/updateInfo').put(updateInfo)
router.route('/delUser').delete(delUser)
router.route('/login').post(login)

module.exports = router