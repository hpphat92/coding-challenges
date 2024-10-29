var express = require('express');
const db = require("../database");
var router = express.Router();

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;

});

module.exports = router;
