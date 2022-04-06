/* eslint-disable no-console */
const args = require('minimist');
const hardhat = require('hardhat');
const { writeFileSync } = require('fs');
const { getContractById } = require('../src/utils/contract');

const flattenContract = async () => {
  const { templateId, targetFile, license } = args(process.argv);

  const { src } = getContractById(templateId);

  const consoleLog = console.log;
  let flatSourceCode;

  // Hackish way to capture and alter log output from hardhat flatten operation. @TODO refactor
  console.log = (data) => {
    flatSourceCode = `// SPDX-License-Identifier: ${license || 'MIXED'}\n\n${data.replace(/SPDX-License-Identifier:/gm, 'License-Identifier:').trim()}`;
  };

  await hardhat.run('flatten', src);

  // Restore console.log
  console.log = consoleLog;

  if (targetFile) {
    writeFileSync(targetFile, flatSourceCode);
  } else {
    console.log(flatSourceCode);
  }
};

if (process.env.NODE_ENV !== 'test') flattenContract();

// Exported for unit testing
module.exports = {
  flattenContract,
};
