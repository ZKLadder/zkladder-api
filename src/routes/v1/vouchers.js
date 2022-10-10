const express = require('express');
const {
  storeVoucher, activateService, deleteVoucher, getVoucher, getAllVouchers, requestVoucher,
} = require('../../services/voucher');
const { getAddress } = require('../../utils/keyManager');
const { isZklMember } = require('../middleware/authentication');

const router = express.Router();

router.post('/', isZklMember, async (req, res, next) => {
  try {
    const voucher = await storeVoucher(req.body);
    res.send(voucher);
  } catch (error) {
    next(error);
  }
});

router.post('/activate', isZklMember, async (req, res, next) => {
  try {
    const { verifiedAddress } = res.locals;
    const results = await activateService({ verifiedAddress, ...req.body });
    res.send(results);
  } catch (error) {
    next(error);
  }
});

router.get('/address', async (req, res, next) => {
  try {
    const { minterKeyId } = req.query;
    const address = await getAddress(minterKeyId);
    res.send({ address });
  } catch (error) {
    next(error);
  }
});

router.delete('/', isZklMember, async (req, res, next) => {
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

router.get('/all', async (req, res, next) => {
  try {
    const voucher = await getAllVouchers(req.query);
    res.send(voucher);
  } catch (error) {
    next(error);
  }
});

router.get('/request', async (req, res, next) => {
  try {
    const signature = req.headers['x-user-identity'];
    const voucher = await requestVoucher({ signature, ...req.query });
    res.send(voucher);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
