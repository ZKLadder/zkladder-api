require('dotenv/config');

// @TODO Remove and defer to Member NFT
const whiteList = [
  '0x69887ffcEdC7E45314c956B0f3029B9C804d0158',
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
];

module.exports = {
  accounts: {
    ganache: process.env.GANACHE_ACCOUNT,
    hardhat: process.env.HARDHAT_ACCOUNT,
  },
  keys: {
    ganache: process.env.GANACHE_PRIVATE_KEY,
    hardhat: process.env.HARDHAT_PRIVATE_KEY,
    rinkeby: process.env.RINKEBY_PRIVATE_KEY,
    ropsten: process.env.ROPSTEN_PRIVATE_KEY,
  },
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'postgres',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  },
  whiteList: (process.env.ACCESS_WHITELIST?.split(',') || whiteList).map(
    (address) => (address.toLowerCase()),
  ),
};
