const express = require('express');
const { storeVoucher, deleteVoucher, getVoucher } = require('../../services/voucher');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const project = await storeVoucher(req.body);
    res.send(project);
  } catch (error) {
    next(error);
  }
});

router.delete('/', authentication, async (req, res, next) => {
  try {
    const project = await deleteVoucher(req.body);
    res.send(project);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const signature = await getVoucher(req.query);
    res.send(signature);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
