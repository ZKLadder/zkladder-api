const express = require('express');
const { createVoucher, deleteVoucher, signVoucher } = require('../../services/voucher');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const project = await createVoucher(req.body);
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

router.get('/signature', async (req, res, next) => {
  try {
    const signature = await signVoucher(req.query);
    res.send(signature);
  } catch (error) {
    next(error);
  }
});

// @TODO GET /vouchers

module.exports = router;
