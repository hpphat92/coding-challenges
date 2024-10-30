var express = require('express');
var db = require('../database');
var router = express.Router();

/* GET users listing. */

router.post('/login', async (req, res) => {
    const {name} = req.body;

    const existingUserByName = await db.model.Players.findOne({displayName: name}).select('name');
    if (!existingUserByName) {
        return res.status(401).json({message: 'User not found'});
    }

    res.status(200).json(existingUserByName);
})

router.post('/', async (req, res, next) => {
    try {
        const {name} = req.body;

        // Validate request data
        if (!name) {
            return res.status(400).json({message: 'Name is mandatory'});
        }

        // Check if name already exists in the database
        const existingUserByName = await db.model.Players.findOne({name: name.toLowerCase()});
        if (existingUserByName) {
            return res.status(400).json({message: 'Name already exists'});
        }

        // Create a new user
        const newUser = new db.model.Players({
            name: name.toLowerCase(), displayName: name,
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({message: 'User created successfully', user: newUser});
    } catch (err) {
        res.status(500).json({message: 'Error creating user', error: err.message});
    }
});

router.get('/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const selectedUser = db.model.Players.findById(userId);
        res.status(200).json(selectedUser);
    } catch (err) {
        res.status(500).json({message: 'Error creating user', error: err.message});
    }
});

module.exports = router;
