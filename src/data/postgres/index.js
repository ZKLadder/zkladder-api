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

require('./models/project')(sequelize);
require('./models/contract')(sequelize);
require('./models/voucher')(sequelize);
require('./models/accessSchema')(sequelize);
require('./models/drops')(sequelize);
require('./models/assets')(sequelize);

sequelize.models.contract.hasMany(sequelize.models.voucher, { targetKey: 'contractAddress' });
sequelize.models.voucher.belongsTo(sequelize.models.contract, { foreignKey: 'contractAddress' });

sequelize.models.drop.hasMany(sequelize.models.asset, { targetKey: 'id' });
sequelize.models.asset.belongsTo(sequelize.models.drop, { foreignKey: 'dropId' });

module.exports = {
  postgres: sequelize,
  voucherModel: sequelize.models.voucher,
  contractModel: sequelize.models.contract,
  projectModel: sequelize.models.project,
  accessSchemaModel: sequelize.models.accessSchema,
  dropModel: sequelize.models.drop,
  assetModel: sequelize.models.asset,
};
