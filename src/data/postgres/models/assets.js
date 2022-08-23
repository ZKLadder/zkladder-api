const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('asset', {
    dropId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenUri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isMinted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });
};
