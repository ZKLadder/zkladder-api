const express = require('express');
const { ClientError } = require('../../utils/error');
const { deployContract } = require('../../services/deploy');
const { getContractById } = require('../../utils/contract');
const { generateContractABI } = require('../../services/compile');

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

router.get('/:contractId/abi', async (req, res, next) => {
  try {
    const { contractId } = req.params;
    if (!contractId) {
      throw new ClientError('Missing required body field');
    }
    const { name, id } = getContractById(contractId);
    const { abi } = generateContractABI(contractId).contracts['zk-contract.sol'][name];
    res.send({ name, id, abi });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
