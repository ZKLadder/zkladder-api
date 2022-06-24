const express = require('express');
const contracts = require('./contracts');
const projects = require('./projects');
const vouchers = require('./vouchers');
const sessions = require('./sessions');
const accessSchemas = require('./accessSchemas');
const data = require('./data');

const router = express.Router();
router.use('/contracts', contracts);
router.use('/projects', projects);
router.use('/vouchers', vouchers);
router.use('/sessions', sessions);
router.use('/data', data);
router.use('/accessSchema', accessSchemas);

module.exports = router;
