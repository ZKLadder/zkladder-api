const express = require('express');
const { createAccessSchema, getAccessSchema, updateAccessSchema } = require('../../services/accessSchemas');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
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

router.patch('/', authentication, async (req, res, next) => {
  try {
    const accessSchema = await updateAccessSchema(req.body);
    res.send(accessSchema);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
