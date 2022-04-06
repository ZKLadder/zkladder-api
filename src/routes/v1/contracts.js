const express = require('express');
const { ClientError } = require('../../utils/error');
const { deployContract } = require('../../services/deploy');
const { getContractById } = require('../../utils/contract');
const { generateContractABI, verifyContract } = require('../../services/compile');
const { createContract, getContracts } = require('../../services/contract');
const authentication = require('../middleware/authentication');
const { checkVerification } = require('../../utils/etherscan');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const contract = await createContract(req.body);
    res.send(contract);
  } catch (error) {
    next(error);
  }
});

router.get('/', authentication, async (req, res, next) => {
  try {
    const contracts = await getContracts(req.query);
    res.send(contracts);
  } catch (error) {
    next(error);
  }
});

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

router.post('/:contractId/verify', async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { chainId, constructParams, contractAddress } = req.body;

    if (!contractId || !chainId || !contractAddress || !constructParams) throw new ClientError('Missing required parameter');
    const result = await verifyContract(contractId, chainId, contractAddress, constructParams);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

router.post('/checkVerification', async (req, res, next) => {
  try {
    const { guid, chainId } = req.body;

    const result = await checkVerification(guid, chainId);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
