const express = require('express');
const contracts = require('./contracts');
const projects = require('./projects');

const router = express.Router();
router.use('/contracts', contracts);
router.use('/projects', projects);

module.exports = router;
