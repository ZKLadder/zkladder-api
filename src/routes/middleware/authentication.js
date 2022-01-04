const { utils } = require('ethers');
const { ClientError } = require('../../utils/error');

const whiteList = [
  '0x69887ffcEdC7E45314c956B0f3029B9C804d0158',
];

const authentication = (req, res, next) => {
  try {
    if (!req.headers['x-user-signature']) throw new ClientError('Missing required x-user-signature header');

    const decodedSignature = Buffer.from(req.headers['x-user-signature'], 'base64').toString().split('_');
    const message = decodedSignature[0];
    const digest = decodedSignature[1];
    const verifiedAddress = utils.verifyMessage(message, digest);

    // @TODO Query member token NFT contract for ownership
    // @TODO Parse out timestamp field and set expiry on signatures
    if (whiteList.includes(verifiedAddress)) return next();
    throw new ClientError('Your Eth account does not have access');
  } catch (error) {
    return next(error);
  }
};

module.exports = authentication;
