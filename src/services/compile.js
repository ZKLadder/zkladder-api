const solc = require('solc');
const { readFileSync } = require('fs');
const { getContractById } = require('../utils/contract');

const getContractSourceFromPath = (path) => {
  if (!path) throw new Error('getContractSourceFromPath called without path');
  return readFileSync(path).toString();
};

const getContractSourceFromId = (id) => {
  if (!id) throw new Error('getContractSourceFromId called without id');
  const { src } = getContractById(id);
  return getContractSourceFromPath(src);
};

const getContractImport = (path) => {
  if (!path) throw new Error('getContractImport called without path');
  const filePath = `node_modules/${path}`;
  const importSource = getContractSourceFromPath(filePath);
  return { contents: importSource };
};

const generateContractABI = ((contractId) => {
  const input = {
    language: 'Solidity',
    sources: {
      'zk-contract.sol': { content: getContractSourceFromId(contractId) },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };

  return JSON.parse(
    solc.compile(JSON.stringify(input), { import: getContractImport }),
  );
});

module.exports = {
  generateContractABI,

  // exported for unit testing
  getContractImport,
  getContractSourceFromPath,
  getContractSourceFromId,
};
