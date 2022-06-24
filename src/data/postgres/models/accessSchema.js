const { DataTypes } = require('sequelize');
const { validateAccessSchema, validateAddress } = require('../../../utils/validators');

module.exports = (sequelize) => {
  sequelize.define('accessSchema', {
    creatorAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEthAddress: (value) => {
          if (!validateAddress(value)) throw new Error('Contract Address is not valid');
          return value;
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accessSchema: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        validateAccessSchema,
      },
    },
  });
};
