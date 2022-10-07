const express = require('express');
const {
  createAssets, getAssets, deleteAssets, updateAsset,
} = require('../../services/asset');
const { isContractAdmin } = require('../middleware/authentication');

const router = express.Router();

router.post('/', isContractAdmin, async (req, res, next) => {
  try {
    const assets = await createAssets(req.body);
    res.send(assets);
  } catch (error) {
    next(error);
  }
});

router.get('/', isContractAdmin, async (req, res, next) => {
  try {
    const assets = await getAssets(req.query);
    res.send(assets);
  } catch (error) {
    next(error);
  }
});

router.delete('/', isContractAdmin, async (req, res, next) => {
  try {
    await deleteAssets(req.body);
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
});

// Public endpoint reports mint failure/success
router.patch('/', async (req, res, next) => {
  try {
    const result = await updateAsset(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
