require('dotenv/config');

module.exports = {
  keys: {
    ganache: process.env.GANACHE_PRIVATE_KEY,
    rinkeby: process.env.RINKEBY_PRIVATE_KEY,
    ropsten: process.env.ROPSTEN_PRIVATE_KEY,
  },
};
