require('dotenv/config');

// @TODO Remove and defer to Member NFT
const whiteList = [
  // '0x69887ffcEdC7E45314c956B0f3029B9C804d0158', // Justin metamask
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat Account [0]
  '0x4a26262236378f0aff37edf6ab7b3ba7452782af', // ZKL Signer
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
  zkl: {
    memberNft: process.env.ZKL_MEMBER_NFT || '0xa5Cf9B89e11B0fAa5123882eDd4358726B443B31',
    memberNftChainId: process.env.ZKL_NFT_CHAINID || '137',
  },
  infuraApi: {
    apiKey: process.env.INFURA_API_KEY,
  },
  ipfs: {
    projectId: process.env.INFURA_IPFS_ID,
    projectSecret: process.env.INFURA_IPFS_SECRET,
  },
  covalent: {
    apiKey: process.env.COVALENT_API_KEY,
    url: process.env.COVALENT_URL || 'https://api.covalenthq.com',
  },
  kms: {
    accessKeyId: process.env.KMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.KMS_SECRET_ACCESS_KEY,
  },
};
