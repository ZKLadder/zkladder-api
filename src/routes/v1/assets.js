const express = require('express');
const {
  createAssets, getAssets, deleteAssets, updateAsset,
} = require('../../services/asset');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const assets = await createAssets(req.body);
    res.send(assets);
  } catch (error) {
    next(error);
  }
});

router.get('/', authentication, async (req, res, next) => {
  try {
    const assets = await getAssets(req.query);
    res.send(assets);
  } catch (error) {
    next(error);
  }
});

router.delete('/', authentication, async (req, res, next) => {
  try {
    await deleteAssets(req.body);
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
});

router.patch('/', authentication, async (req, res, next) => {
  try {
    const result = await updateAsset(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
