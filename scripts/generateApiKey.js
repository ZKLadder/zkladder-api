/* eslint-disable no-underscore-dangle */
const sigUtil = require('@metamask/eth-sig-util');
const { getAccountByNetworkId } = require('../src/services/accounts');

const getFormattedJson = () => ({
  domain: {
    name: 'zkladder.com',
    version: '1',
  },
  message: {
    content: 'Hello from your friends at ZKLadder. Please accept this signature request to get started',
    timestamp: Date.now(),
  },
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
    ],
    message: [
      { name: 'content', type: 'string' },
      { name: 'timestamp', type: 'uint256' },
    ],
  },
  primaryType: 'message',
});

const generateKey = async () => {
  const { privateKey } = getAccountByNetworkId('3')[0];
  const data = getFormattedJson();

  const signature = await sigUtil.signTypedData({
    data,
    privateKey: Buffer.from(privateKey, 'hex'),
    version: 'V4',
  });

  // Return as b64 string as defined by ZKL API
  return Buffer.from(`${JSON.stringify(data)}_${signature}`).toString('base64');
};

/* eslint-disable no-console */
if (process.env.NODE_ENV !== 'test') generateKey().then((val) => { console.log(val); });

// Exported for unit testing
module.exports = {
  generateKey,
};
