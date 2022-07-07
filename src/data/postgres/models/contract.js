const { DataTypes } = require('sequelize');
const { validateAddress } = require('../../../utils/validators');
const getNetworkById = require('../../../utils/getNetworkById');

module.exports = (sequelize) => {
  sequelize.define('contract', {
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      validate: {
        isEthAddress: (value) => {
          if (!validateAddress(value)) throw new Error('Contract Address is not valid');
          return value;
        },
      },
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true,
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
    templateId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEthAddress: (value) => {
          if (!validateAddress(value)) throw new Error('Creator is not a valid address');
          return value;
        },
      },
    },
    admins: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      validate: {
        isEthAddress: (admins) => {
          admins.forEach((address) => {
            if (!validateAddress(address)) throw new Error('Admins member is not a valid address');
          });

          return admins;
        },
      },
    },
  });
};
