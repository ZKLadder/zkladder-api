const express = require('express');
const { createContract, getContracts, updateContract } = require('../../services/contract');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const contract = await createContract(req.body);
    res.send(contract);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const contracts = await getContracts(req.query);
    res.send(contracts);
  } catch (error) {
    next(error);
  }
});

router.patch('/', authentication, async (req, res, next) => {
  try {
    const contracts = await updateContract(req.body);
    res.send(contracts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
