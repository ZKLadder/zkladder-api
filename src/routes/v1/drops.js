const express = require('express');
const { createDrop, getDrops, updateDrop } = require('../../services/drop');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const drop = await createDrop(req.body);
    res.send(drop);
  } catch (error) {
    next(error);
  }
});

router.get('/', authentication, async (req, res, next) => {
  try {
    const drops = await getDrops(req.query);
    res.send(drops);
  } catch (error) {
    next(error);
  }
});

router.patch('/', authentication, async (req, res, next) => {
  try {
    const drop = await updateDrop(req.body);
    res.send(drop);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
