const contracts = require('../data/contractMapping');

const getContractById = (contractId) => {
  if (!contracts[contractId]) throw new Error('Requested unsupported contract id');
  return contracts[contractId];
};

module.exports = getContractById;
