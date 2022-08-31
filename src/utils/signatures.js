/* eslint-disable prefer-destructuring */
const sigUtil = require('@metamask/eth-sig-util');
const { MemberNft } = require('@zkladder/zkladder-sdk-ts');
const { zkl, ipfs, whiteList } = require('../config');

let zklMemberNft;

/**
 * Decodes the signature and determines if the signer has access to the API
 * @param {*} signature A b64 string encoding JSON content and a signed digest seperatd by an '_'
 * @returns boolean indiciating if signer has access
 */
const hasAccess = async (signature) => {
  let content;
  let digest;

  try {
    const decodedSignature = Buffer.from(signature, 'base64').toString('ascii').split('_');
    content = JSON.parse(decodedSignature[0]);
    digest = decodedSignature[1];
  } catch (err) {
    return { session: false };
  }

  const verifiedAddress = sigUtil.recoverTypedSignature({
    data: content,
    signature: digest,
    version: 'V4',
  });

  if (!zklMemberNft) {
    zklMemberNft = await MemberNft.setup({
      chainId: 137,
      address: zkl.memberNft,
      infuraIpfsProjectId: ipfs.projectId,
      infuraIpfsProjectSecret: ipfs.projectSecret,
    });
  }

  const totalSupply = await zklMemberNft.totalSupply();
  const tokens = await zklMemberNft.getAllTokensOwnedBy(verifiedAddress);

  if (tokens.length < 1
     && !whiteList.includes(verifiedAddress.toLowerCase())) return { session: false };

  // Signature has expired (issued over 48 hours in the past)
  if (Date.now() > (content.message.timestamp + 172800000)) return { session: false };

  // Signature issued in the future
  if ((Date.now() + 10000) < content.message.timestamp) return { session: false };

  return {
    session: true,
    verifiedAddress,
    memberToken: {
      totalSupply,
      ...tokens[0],
    },
  };
};

module.exports = { hasAccess };
