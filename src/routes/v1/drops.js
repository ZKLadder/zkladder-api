const express = require('express');
const {
  createDrop, getDrops, updateDrop, getDrop,
} = require('../../services/drop');
const { isContractAdmin } = require('../middleware/authentication');

const router = express.Router();

router.post('/', isContractAdmin, async (req, res, next) => {
  try {
    const drop = await createDrop(req.body);
    res.send(drop);
  } catch (error) {
    next(error);
  }
});

router.get('/', isContractAdmin, async (req, res, next) => {
  try {
    const drops = await getDrops(req.query);
    res.send(drops);
  } catch (error) {
    next(error);
  }
});

router.patch('/', isContractAdmin, async (req, res, next) => {
  try {
    const drop = await updateDrop(req.body);
    res.send(drop);
  } catch (error) {
    next(error);
  }
});

// Public route enabling end users to fetch limited data on a single drop
router.get('/:dropId', async (req, res, next) => {
  try {
    const drops = await getDrop(req.params.dropId);
    res.send(drops);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
