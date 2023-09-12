const User = require('./models/users.js')
const Manager = require('./models/passwords.js')
const bcrypt = require('bcrypt');
const asyncwrapper = require('../middleware/asyncwrapper.js')
const { createCustomError } = require('../errors/custom-errors.js')


asyncwrapper(async function createUser(req, res) {


    const existingUser = await User.findOne({ name: req.body.name });

    if (existingUser) {
        return next(createCustomError('User already exists.', 404))
    }


    const newUser = await User.create(req.body);
    res.status(201).json({ newUser });

})

asyncwrapper(async function createPassword(req, res) {

    const { user, passManager } = req.body;


    const existingUser = await User.findOne({ name: user });

    if (!existingUser) {
        return next(createCustomError('User does not exist. Please create a user with this name and try again.', 404))

    }


    const existingManager = await Manager.findOne({ user: user });

    if (existingManager) {
        return next(createCustomError('Password manager already exists for this user. Proceed to update.', 409))

    }


    const newInput = await Manager.create(req.body);

    res.status(201).json(newInput);

})

asyncwrapper(async function updatePassword(req, res) {

    const { user, passManagerKey, passManagerValue } = req.body;

    const exist = User.find({ name: user })
    if (!exist) {
        return next(createCustomError('User does not exist please create an account and try again', 404))
    }

    const updatedUser = await Manager.findOneAndUpdate(
        { user },
        { $set: { [`passManager.${passManagerKey}`]: passManagerValue } },
        { upsert: true, new: true }
    );

    res.status(200).json(updatedUser);

})

asyncwrapper(async function showUser(req, res) {

    const data = await User.find({});
    res.status(200).json(data);

})

asyncwrapper(async function showPassword(req, res) {

    const data = await Manager.find({});
    res.status(200).json(data);

})

asyncwrapper(async function updateInfo(req, res) {

    const { name, newPassword ,oldPassword} = req.body;
  
    const existingUser = await User.findOne({ name });

    if (!existingUser) {
        return next(createCustomError('User not found', 404))
    }

    if(oldPassword != existingUser.password){
        return next(createCustomError('Please check User Info and try again',404))
    }

    if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        existingUser.password = hashedPassword;
    }

    await existingUser.save();

    res.status(200).json({ message: 'User information updated successfully.' });

})

asyncwrapper(async function delUser(req, res) {

    const { name, password } = req.body;

    const userToDelete = await User.findOne({ name });

    if (!userToDelete) {
        return next(createCustomError('User not found', 404))
    }

    const isPasswordValid = await bcrypt.compare(password, userToDelete.password);

    if (!isPasswordValid) {
        return next(createCustomError('Invalid Credentials', 401))
    }


    await User.deleteOne({ name });


    const managerToDelete = await Manager.findOne({ user: name });
    if (managerToDelete) {
        await Manager.deleteOne({ user: name });
    }

    res.status(200).json({ message: 'User deleted successfully.' });

})
module.exports = {
    createUser,
    createPassword,
    updateInfo,
    updatePassword,
    showPassword,
    showUser,
    delUser
}