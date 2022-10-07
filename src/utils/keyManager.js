/* eslint-disable no-underscore-dangle */
const {
  KMSClient, CreateKeyCommand, GetPublicKeyCommand, SignCommand,
} = require('@aws-sdk/client-kms');
const asn1 = require('asn1.js');
const { utils, BigNumber } = require('ethers');
const config = require('../config');
const { keyPolicy, secp256k1N } = require('../data/constants/awsKms');

const ecdsaPublicKey = asn1.define('EcdsaPubKey', function decode() {
  // parse according to https://tools.ietf.org/html/rfc5480#section-2
  this.seq().obj(
    this.key('algo').seq().obj(
      this.key('a').objid(),
      this.key('b').objid(),
    ),
    this.key('pubKey').bitstr(),
  );
});

const ecdsaSignature = asn1.define('EcdsaSig', function decode() {
  // parse according to https://tools.ietf.org/html/rfc3279#section-2.2.3
  this.seq().obj(
    this.key('r').int(),
    this.key('s').int(),
  );
});

const kmsClient = new KMSClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: config.kms.accessKeyId,
    secretAccessKey: config.kms.secretAccessKey,
  },
});

const createECDSAKey = async () => {
  const createKeyCommand = new CreateKeyCommand({
    KeySpec: 'ECC_SECG_P256K1',
    KeyUsage: 'SIGN_VERIFY',
    Policy: keyPolicy,
  });

  const { KeyMetadata } = await kmsClient.send(createKeyCommand);

  return {
    keyId: KeyMetadata.KeyId,
    keyArn: KeyMetadata.Arn,
  };
};

const getPublicKey = async (keyId) => {
  const getPublicKeyCommand = new GetPublicKeyCommand({
    KeyId: keyId,
  });

  const { PublicKey } = await kmsClient.send(getPublicKeyCommand);

  const { pubKey } = ecdsaPublicKey.decode(Buffer.from(PublicKey), 'der');

  return `0x${pubKey.data.toString('hex')}`;
};

const getAddress = async (keyId) => {
  const pubKey = await getPublicKey(keyId);
  return utils.computeAddress(pubKey);
};

const signVoucher = async (keyId, voucher) => {
  const addressSigning = await getAddress(keyId);

  const { domain, types, value } = voucher;

  // Hash the voucher according to https://eips.ethereum.org/EIPS/eip-712
  const hashed = utils._TypedDataEncoder.hash(domain, types, value);

  const signCommand = new SignCommand({
    KeyId: keyId,
    Message: Buffer.from(hashed.slice(2), 'hex'),
    SigningAlgorithm: 'ECDSA_SHA_256',
    MessageType: 'DIGEST',
  });

  const { Signature } = await kmsClient.send(signCommand);

  // Convert DER encoded AWS signature to hex
  const derEncodedSignature = ecdsaSignature.decode(Buffer.from(Signature), 'der');
  const r = `0x${derEncodedSignature.r.toString(16)}`;
  let s = `0x${derEncodedSignature.s.toString(16)}`;

  // Ensure that the 's' value conforms to https://eips.ethereum.org/EIPS/eip-2
  const maxEcdsa = BigNumber.from(secp256k1N);
  const halfMaxEcdsa = maxEcdsa.div(BigNumber.from(2));
  if (BigNumber.from(s).gt(halfMaxEcdsa)) {
    s = maxEcdsa.sub(BigNumber.from(s)).toHexString();
  }

  // Determine recovery value and return signature
  if (addressSigning === utils.verifyTypedData(domain, types, value, { r, s, v: 27 })) {
    return utils.joinSignature({ r, s, recoveryParam: 0 });
  }

  return utils.joinSignature({ r, s, recoveryParam: 1 });
};

module.exports = {
  createECDSAKey, getPublicKey, getAddress, signVoucher,
};
