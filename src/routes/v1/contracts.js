const express = require('express');
const { ClientError } = require('../../utils/error');
const { deployContract } = require('../../services/deploy');

const router = express.Router();

router.post('/deploy', async (req, res, next) => {
  try {
    const { contractId, constructParams, networkId } = req.body;
    if (!contractId || !constructParams || !networkId) {
      throw new ClientError('Missing required body field');
    }
    const contractData = await deployContract(contractId, networkId, constructParams);
    res.send(contractData);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
