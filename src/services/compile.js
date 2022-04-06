/* eslint-disable no-console */
const solc = require('solc');
const { readFileSync } = require('fs');
const hardhat = require('hardhat');
const { getContractById, abiEncode } = require('../utils/contract');
const { verify } = require('../utils/etherscan');
const { validateConstructorParams } = require('../utils/contract');

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
  const { name } = getContractById(3);
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
  ).contracts['zk-contract.sol'][name];
});

const verifyContract = async (contractId, chainId, contractAddress, constructParams) => {
  const originalLogFunction = console.log;

  const { src, name } = getContractById(contractId);

  let sourcecode;

  // Hacky way to capture log output from hardhat flatten operation. @TODO refactor
  console.log = (data) => {
    sourcecode = `// SPDX-License-Identifier: MIXED\n\n${data.replace(/SPDX-License-Identifier:/gm, 'License-Identifier:').trim()}`;
  };

  await hardhat.run('flatten', src);

  // Restore console.log
  console.log = originalLogFunction;

  console.log(sourcecode);

  const compiledContract = generateContractABI(contractId);

  // Throws if constructParams are shaped incorrectly
  validateConstructorParams(compiledContract.abi, constructParams);

  const result = await verify(
    chainId,
    sourcecode,
    contractAddress,
    name,
    'v0.8.8+commit.dddeac2f',
    abiEncode('constructor', compiledContract.abi, constructParams).slice(2),
  );

  return result;
};

module.exports = {
  generateContractABI,
  verifyContract,

  // exported for unit testing
  getContractImport,
  getContractSourceFromPath,
  getContractSourceFromId,
};
