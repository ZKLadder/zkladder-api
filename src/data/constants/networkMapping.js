const config = require('../../config');

module.exports = {
  1: {
    name: 'Ethereum',
    currency: 'ETH',
    chainId: 1,
    RPCEndpoint: `https://mainnet.infura.io/v3/${config.infuraApi.apiKey}`,
  },
  3: {
    name: 'Ropsten',
    currency: 'ROP',
    chainId: 3,
    RPCEndpoint: `https://ropsten.infura.io/v3/${config.infuraApi.apiKey}`,
  },
  4: {
    name: 'Rinkeby',
    currency: 'RIN',
    chainId: 4,
    RPCEndpoint: `https://rinkeby.infura.io/v3/${config.infuraApi.apiKey}`,
  },
  5: {
    name: 'Goerli',
    currency: 'GOR',
    chainId: 5,
    RPCEndpoint: `https://goerli.infura.io/v3/${config.infuraApi.apiKey}`,
  },
  137: {
    name: 'Polygon',
    currency: 'MATIC',
    chainId: 137,
    RPCEndpoint: `https://polygon-mainnet.infura.io/v3/${config.infuraApi.apiKey}`,
  },
  80001: {
    name: 'Polygon Mumbai',
    currency: 'Test-MATIC',
    chainId: 80001,
    RPCEndpoint: 'https://matic-mumbai.chainstacklabs.com',
  },
  5777: {
    name: 'Ganache',
    currency: 'LOCAL',
    chainId: 5777,
    RPCEndpoint: 'http://localhost:7545',
  },
  31337: {
    name: 'Hardhat',
    currency: 'HAT',
    chainId: 31337,
    RPCEndpoint: 'http://localhost:8545',
  },
};
