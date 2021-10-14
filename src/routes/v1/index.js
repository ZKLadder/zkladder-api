const express = require('express');
const contracts = require('./contracts');

const router = express.Router();
router.use('/contracts', contracts);

module.exports = router;
