/* eslint-disable no-underscore-dangle */

const sigUtil = require('@metamask/eth-sig-util');
const { MemberNft } = require('@zkladder/zkladder-sdk-ts');
const { getTransactionSigner } = require('../services/accounts');
const { zkl, ipfs, whiteList } = require('../config');

let zklMemberNft;

/**
 * Returns a signed mint voucher used to mint new tokens on any ZKL whitelisted NFT deployment
 * https://eips.ethereum.org/EIPS/eip-712
 * @param {*} options Signature and mint options
 * @returns Signed mint voucher
 */
const nftWhitelistedVoucher = async (options) => {
  const {
    chainId,
    contractName,
    contractAddress,
    wallet,
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
      { name: 'balance', type: 'uint256' },
      { name: 'minter', type: 'address' },
    ],
  };

  const value = {
    balance,
    minter,
  };

  const signature = await signer._signTypedData(domain, types, value);

  return {
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
const hasAccess = async (signature) => {
  const decodedSignature = Buffer.from(signature, 'base64').toString('ascii').split('_');
  const content = JSON.parse(decodedSignature[0]);
  const digest = decodedSignature[1];

  const verifiedAddress = sigUtil.recoverTypedSignature({
    data: content,
    signature: digest,
    version: 'V4',
  });

  console.log('address', verifiedAddress);

  if (!zklMemberNft) {
    const ethersSigner = getTransactionSigner(zkl.memberNftChainId);
    zklMemberNft = await MemberNft.setup({
      provider: ethersSigner,
      address: zkl.memberNft,
      infuraIpfsProjectId: ipfs.projectId,
      infuraIpfsProjectSecret: ipfs.projectSecret,
    });
  }

  const totalSupply = await zklMemberNft.totalSupply();
  const tokens = await zklMemberNft.getAllTokensOwnedBy(verifiedAddress);

  console.log('supply', totalSupply);
  console.log('tokens', tokens);

  if (tokens.length < 1
     && !whiteList.includes(verifiedAddress.toLowerCase())) return { session: false };
  console.log('passed 1');
  // Signature has expired (issued over 48 hours in the past)
  if (Date.now() > (content.message.timestamp + 172800000)) return { session: false };
  console.log('passed 2');
  // Signature issued in the future
  if (Date.now() < content.message.timestamp) return { session: false };
  console.log('passed 3');
  return {
    session: true,
    memberToken: {
      totalSupply,
      ...tokens[0],
    },
  };
};

module.exports = { nftWhitelistedVoucher, hasAccess };
