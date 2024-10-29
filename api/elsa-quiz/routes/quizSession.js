var express = require('express');
const db = require("../database");
var router = express.Router();

router.get('/:sessionId', async (req, res) => {
    const questionId = req.params.sessionId;
});

module.exports = router;
