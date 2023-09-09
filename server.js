const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/users.js') 
const Manager = require('./models/passwords.js')
const PORT = process.env.PORT || 3000;

app.use(express.json())

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

app.post('/userCreate', async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(200).json(newUser);
    } catch (error) {
        handleErrors(res, error);
    }
});

app.post('/savePassword', async (req, res) => {
    try {
        const newInput = await Manager.create(req.body)
        res.status(200).json(newInput);
    } catch (error) {
        handleErrors(res, error);
    }
});

app.get('/showPassword', async (req, res) => { 
    try {
        const data = await Manager.find({});
        res.status(200).json(data);
    } catch (error) {
        handleErrors(res, error);
    }
});


app.listen(PORT, () => {
    console.log("Server has been hit")
    console.log(`Server is running on http://localhost:${PORT}`);
});
