const User = require('../models/users')
const Manager = require('../models/passwords')
const bcrypt = require('bcrypt');
const asyncwrapper = require('../middleware/asyncwrapper.js')
const { createCustomError } = require('../errors/custom-errors.js')


const createUser = asyncwrapper(async (req, res, next) => {


    const existingUser = await User.findOne({ name: req.body.name });

    if (existingUser) {
        return next(createCustomError('User already exists.', 404))
    }


    const newUser = await User.create(req.body);
    res.status(201).json({ newUser });

})

const createPassword = asyncwrapper(async (req, res, next) => {

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

const updatePassword = asyncwrapper(async (req, res, next) => {

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

const showUser = asyncwrapper(async (req, res, next) => {

    const data = await User.find({});
    res.status(200).json(data);

})

const showPassword = asyncwrapper(async (req, res, next) => {

    const data = await Manager.find({});
    res.status(200).json(data);

})

const updateInfo = asyncwrapper(async (req, res, next) => {
    const { name, oldPassword, newPassword } = req.body;

    const existingUser = await User.findOne({ name });

    if (!existingUser) {
        return next(createCustomError('User not found', 404));
    }

    if (oldPassword && newPassword) {
        
        const isOldPassValid = await bcrypt.compare(oldPassword, existingUser.password);

        if (!isOldPassValid) {
            return next(createCustomError('Invalid old password', 401));
        }

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        existingUser.password = hashedPassword;
    } else {
        return next(createCustomError('Invalid request. Both oldPassword and newPassword are required.', 400));
    }

    await existingUser.save();

    res.status(200).json({ message: 'User information updated successfully.' });
});



const delUser = asyncwrapper(async (req, res, next) => {
  const { name } = req.body; 
  const existingUser = await User.findOne({ name });

  if (!existingUser) {
    return next(createCustomError('User not found', 404));
  }

  await User.deleteOne({ name});
  await Manager.deleteOne({ user: name });

  res.status(200).json({ message: 'User deleted successfully.' });
});
const login = asyncwrapper(async(req,res,next)=>{
    const {name,password} = req.body
    const existingUser = await User.findOne({name})
    if (!existingUser) {
        return next(createCustomError('User not found', 404));
    }

    if(!password){
        return next(createCustomError('Input your password you fool', 404));
    }

  
        const pass = await bcrypt.compare(password,existingUser.password)
        if(!pass){
            return next(createCustomError('Invalid Credentials', 401));
        }
    res.status(200).json({message:'Welcome back'})
})


module.exports = {
    createUser,
    createPassword,
    updateInfo,
    updatePassword,
    showPassword,
    showUser,
    delUser,
    login
}