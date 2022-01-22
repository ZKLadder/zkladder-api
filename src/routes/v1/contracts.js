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
    const { name } = getContractById(contractId);
    const compiledContract = generateContractABI(contractId);
    const { abi } = compiledContract;
    const bytecode = compiledContract.evm.bytecode.object;
    res.send({
      name, contractId, abi, bytecode,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
