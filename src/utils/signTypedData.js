/* eslint-disable no-underscore-dangle */
const { getTransactionSigner } = require('../services/accounts');

const nftWhitelisted = async (options) => {
  const {
    chainId,
    contractName,
    contractAddress,
    wallet,
    tokenUri,
    balance,
    minter,
  } = options;

  const signer = wallet || getTransactionSigner(chainId);

  const domain = {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  };

  const types = {
    mintVoucher: [
      { name: 'tokenUri', type: 'string' },
      { name: 'balance', type: 'uint256' },
      { name: 'minter', type: 'address' },
    ],
  };

  const value = {
    tokenUri,
    balance,
    minter,
  };

  const signature = await signer._signTypedData(domain, types, value);

  return {
    tokenUri,
    balance,
    minter,
    signature,
  };
};

module.exports = { nftWhitelisted };
