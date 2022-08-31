const express = require('express');
const { getTransactions, getAssetPrices } = require('../../services/data');
// const authentication = require('../middleware/authentication');

const router = express.Router();

router.get('/transactions', async (req, res, next) => {
  try {
    const transactions = await getTransactions(req.query);
    res.send(transactions);
  } catch (error) {
    next(error);
  }
});

router.get('/prices', async (req, res, next) => {
  try {
    const prices = await getAssetPrices(req.query);
    res.send(prices);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
