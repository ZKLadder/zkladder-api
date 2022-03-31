const express = require('express');
const { storeVoucher, deleteVoucher, getVoucher } = require('../../services/voucher');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const voucher = await storeVoucher(req.body);
    res.send(voucher);
  } catch (error) {
    next(error);
  }
});

router.delete('/', authentication, async (req, res, next) => {
  try {
    const result = await deleteVoucher(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const voucher = await getVoucher(req.query);
    res.send(voucher);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
