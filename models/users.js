const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name."]
        },
        password: {
            type: String,
            required: [true, "Please provide a password."]
        },
    
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
