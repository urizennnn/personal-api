const express = require('express')
const bcrypt = require('bcrypt');
const app = express()
const mongoose = require('mongoose')
const User = require('./models/users.js')
const Manager = require('./models/passwords.js')
const PORT = process.env.PORT || 3000;
const cors = require('cors')

app.use(express.json())
app.use(cors({
    origin: "*"
}))


mongoose.set("strictQuery", false)
mongoose.connect('mongodb+srv://urizen:urizenYt132@timer.9w3awsf.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connected')
    }).catch((error) => {
        console.log(error)
    })

app.get('/', (req, res) => {
    res.send('Welcome to my new api')
})

const handleErrors = (res, error) => {
    console.error(error);
    res.status(500).json({ message: error.message });
};

app.post('/createUser', async (req, res) => {
    try {

        const existingUser = await User.findOne({ name: req.body.name });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }


        const newUser = await User.create(req.body);
        res.status(201).json({newUser});
    } catch (error) {
        handleErrors(res, error)
    }
});
app.post('/createPassword', async (req, res) => {
    try {
        

        const { user, passManager } = req.body;
        const exists = User.find({name:user})
        if(!exists)return res.status(404).json({message:'Please create a user with this name and try again'})
        const existingUser = await Manager.findOne({ user: user });

        if (existingUser) {
            return res.status(400).json({ message: 'Collection already exist please procees to update' });
        }

        
        const newInput = await Manager.create(req.body)
        res.status(200).json(newInput);

        
    } catch (error) {
        handleErrors(res, error);
    }
});

app.post('/updatePassword', async (req, res) => {
    try {
        const { user, passManagerKey, passManagerValue } = req.body;

        // Find the existing user by 'user' field and update or create it
        const updatedUser = await Manager.findOneAndUpdate(
            { user },
            { $set: { [`passManager.${passManagerKey}`]: passManagerValue } },
            { upsert: true, new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        handleErrors(res, error);
    }
});


app.get('/showUser', async (req, res) => {
    try {
        const data = await User.find({});
        res.status(200).json(data);
    } catch (error) {
        handleErrors(res, error)
    }
})
app.get('/showPassword', async (req, res) => {
    try {
        const data = await Manager.find({});
        res.status(200).json(data);
    } catch (error) {
        handleErrors(res, error);
    }
});
app.patch('/updateInfo', async (req, res) => {
    try {
        const { name, newPassword } = req.body;


        const existingUser = await User.findOne({ name });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            existingUser.password = hashedPassword;
        }

        await existingUser.save();

        res.status(200).json({ message: 'User information updated successfully.' });
    } catch (error) {
        handleErrors(res, error);
    }
});



app.delete('/delUser', async (req, res) => {
    try {
        const { name, password } = req.body;

        const userToDelete = await User.findOne({ name });

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, userToDelete.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        
        await User.deleteOne({ name });

        
        const managerToDelete = await Manager.findOne({ user: name });
        if (managerToDelete) {
            await Manager.deleteOne({user: name });
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
    
        handleErrors(res, error);
    }
});


app.listen(PORT, () => {
    console.log("Server has been hit")
    console.log(`Server is running on http://localhost:${PORT}`);
});
