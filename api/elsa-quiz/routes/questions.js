var express = require('express');
const db = require("../database");
var router = express.Router();

router.get('/', async (req, res) => {
    try {
        const questions = await db.model.Questions.find().select('question answers');
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err });
    }
});

module.exports = router;
