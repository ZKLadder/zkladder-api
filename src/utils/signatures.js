/* eslint-disable no-underscore-dangle */
const sigUtil = require('@metamask/eth-sig-util');
const { getTransactionSigner } = require('../services/accounts');
const { whiteList } = require('../config');

/**
 * Returns a signed mint voucher used to mint new tokens on any ZKL whitelisted NFT deployment
 * https://eips.ethereum.org/EIPS/eip-712
 * @param {*} options Signature and mint options
 * @returns Signed mint voucher
 */
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

/**
 * Decodes the signature and determines if the signer has access to the API
 * @param {*} signature A b64 string encoding JSON content and a signed digest seperatd by an '_'
 * @returns boolean indiciating if signer has access
 */
const hasAccess = (signature) => {
  const decodedSignature = Buffer.from(signature, 'base64').toString('ascii').split('_');
  const content = JSON.parse(decodedSignature[0]);
  const digest = decodedSignature[1];

  const verifiedAddress = sigUtil.recoverTypedSignature({
    data: content,
    signature: digest,
    version: 'V4',
  });

  // @TODO Check member token contract for ownership
  if (!whiteList.includes(verifiedAddress.toLowerCase())) return false;

  // Signature has expired (issued over 48 hours in the past)
  if (Date.now() > (content.message.timestamp + 172800000)) return false;

  // Signature issued in the future
  if (Date.now() < content.message.timestamp) return false;

  return true;
};

module.exports = { nftWhitelisted, hasAccess };
