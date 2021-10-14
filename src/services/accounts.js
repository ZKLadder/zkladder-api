const { ethers } = require('ethers');
const accounts = require('../data/accountMapping');
const getNetworkById = require('../utils/getNetworkById');

const getAccountByNetworkId = (networkId) => {
  if (!accounts[networkId]) throw new Error('Requested accounts from unsupported network id');
  return accounts[networkId];
};

const getTransactionSigner = (networkId) => {
  const provider = new ethers.providers.JsonRpcProvider(getNetworkById(networkId).RPCEndpoint);
  const { privateKey } = getAccountByNetworkId(networkId)[0];
  return new ethers.Wallet(privateKey, provider);
};

module.exports = {
  getTransactionSigner,

  // exported for unit testing
  getAccountByNetworkId,
};
