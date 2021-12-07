require('dotenv/config');

module.exports = {
  keys: {
    ganache: process.env.GANACHE_PRIVATE_KEY,
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
};
