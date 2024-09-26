const express = require('express');
const router = express.Router();


const tokenController = require('../controllers/token');

router.get('/get-token', tokenController.getToken);

module.exports = router;
