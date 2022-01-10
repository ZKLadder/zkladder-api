/**
 * @type import('hardhat/config').HardhatUserConfig
 */
/* eslint-disable-next-line */
require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: '0.8.2',
  paths: {
    sources: './src/contracts',
    tests: './__tests__/contracts',
    artifacts: './src/artifacts',
  },
};
