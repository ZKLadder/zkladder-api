const { Sequelize } = require('sequelize');
const { postgres } = require('../../config');

const sequelize = new Sequelize(
  postgres.database,
  postgres.user,
  postgres.password,
  {
    host: postgres.host,
    port: postgres.port,
    dialect: 'postgres',
    logging: false,
  },
);

module.exports = sequelize;
