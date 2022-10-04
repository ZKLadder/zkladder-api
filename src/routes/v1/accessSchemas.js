const express = require('express');
const { createAccessSchema, getAccessSchema, updateAccessSchema } = require('../../services/accessSchemas');
const { isZklMember } = require('../middleware/authentication');

const router = express.Router();

router.post('/', isZklMember, async (req, res, next) => {
  try {
    const accessSchema = await createAccessSchema(req.body);
    res.send(accessSchema);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const accessSchemas = await getAccessSchema(req.query);
    res.send(accessSchemas);
  } catch (error) {
    next(error);
  }
});

router.patch('/', async (req, res, next) => {
  try {
    const accessSchema = await updateAccessSchema(req.body);
    res.send(accessSchema);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
