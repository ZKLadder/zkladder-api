const networks = require('../data/constants/networkMapping');

const getNetworkById = (networkId) => {
  if (!networks[networkId]) throw new Error('Requested unsupported network id');
  return networks[networkId];
};

module.exports = getNetworkById;
