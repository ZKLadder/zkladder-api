/* eslint-disable no-underscore-dangle */
const { ethToWei } = require('./conversions');

/**
 * Returns a signed mint voucher used to mint new tokens on a ZKL MemberNftV1 deployment
 * https://eips.ethereum.org/EIPS/eip-712
 * @param {*} options Signature and mint options
 * @returns Signed mint voucher
 */
const memberNftV1Voucher = async (options) => {
  const {
    chainId,
    contractName,
    contractAddress,
    signer,
    balance,
    salePrice,
    minter,
  } = options;

  const domain = {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  };

  const types = {
    mintVoucher: [
      { name: 'balance', type: 'uint256' },
      { name: 'salePrice', type: 'uint256' },
      { name: 'minter', type: 'address' },
    ],
  };

  const salePriceInWei = ethToWei(salePrice);

  const value = {
    balance,
    minter,
    salePrice: salePriceInWei.toString(),
  };

  const signature = await signer._signTypedData(domain, types, value);

  return {
    balance,
    minter,
    salePrice: salePriceInWei,
    signature,
  };
};

/**
 * Returns a signed mint voucher used to mint new tokens on a ZKL MemberNftV2 deployment
 * https://eips.ethereum.org/EIPS/eip-712
 * @param {*} options Signature and mint options
 * @returns Signed mint voucher
 */
const memberNftV2Voucher = (options) => {
  const {
    chainId,
    contractName,
    contractAddress,
    tokenId,
    tierId,
    minter,
    tokenUri,
  } = options;

  const domain = {
    chainId,
    name: contractName,
    verifyingContract: contractAddress,
    version: '1',
  };

  const types = {
    mintVoucher: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'tierId', type: 'uint32' },
      { name: 'minter', type: 'address' },
      { name: 'tokenUri', type: 'string' },
    ],
  };

  const value = {
    tokenId,
    tierId,
    minter,
    tokenUri,
  };

  return {
    domain,
    types,
    value,
  };
};

module.exports = { memberNftV1Voucher, memberNftV2Voucher };
