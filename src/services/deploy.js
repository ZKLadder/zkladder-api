const { ethers } = require('ethers');
const { ApplicationErrorWithObject } = require('../utils/error');
const { getTransactionSigner } = require('./accounts');
const { generateContractABI } = require('./compile');
const { validateConstructorParams } = require('../utils/contract');

const deployContract = async (contractId, networkId, constructParams) => {
  let compiledContract;
  try {
    compiledContract = generateContractABI(contractId);
    validateConstructorParams(compiledContract.contracts['zk-contract.sol'].ZK_ERC721.abi, constructParams);
  } catch (error) {
    throw new ApplicationErrorWithObject(
      error.message,
      {
        info: 'Failed to compile contract', contractId, networkId, constructParams,
      },
      error.stack,
    );
  }

  let transactionSigner;
  try {
    transactionSigner = getTransactionSigner(networkId);
  } catch (error) {
    throw new ApplicationErrorWithObject(
      error.message,
      {
        info: 'Failed to get transaction signer', contractId, networkId, constructParams,
      },
      error.stack,
    );
  }

  try {
    const contractFactory = new ethers.ContractFactory(
      compiledContract.contracts['zk-contract.sol'].ZK_ERC721.abi,
      compiledContract.contracts['zk-contract.sol'].ZK_ERC721.evm.bytecode.object,
      transactionSigner,
    );
    const contract = await contractFactory.deploy(...constructParams);
    return contract;
  } catch (error) {
    throw new ApplicationErrorWithObject(
      error.message,
      {
        info: 'Failed to deploy contract', contractId, networkId, constructParams,
      },
      error.stack,
    );
  }
};

module.exports = {
  deployContract,
};
