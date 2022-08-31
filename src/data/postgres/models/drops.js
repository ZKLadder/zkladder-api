const { DataTypes } = require('sequelize');
const { validateAddress } = require('../../../utils/validators');
const getNetworkById = require('../../../utils/getNetworkById');

module.exports = (sequelize) => {
  sequelize.define('drop', {
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEthAddress: (value) => {
          if (!validateAddress(value)) throw new Error('Contract Address is not valid');
          return value;
        },
      },
    },
    chainId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isSupportedNetwork: (value) => {
          getNetworkById(value);
          return value;
        },
      },
    },
    tierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    startTime: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true,
      },
    },
    endTime: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true,
      },
    },
    accessSchemaId: {
      type: DataTypes.INTEGER,
    },
    totalTokens: {
      type: DataTypes.INTEGER,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
  });
};
