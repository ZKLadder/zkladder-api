const { DataTypes } = require('sequelize');
const getNetworkById = require('../../../utils/getNetworkById');
const { validateAddress } = require('../../../utils/validators');

module.exports = (sequelize) => {
  sequelize.define('asset', {
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
    dropId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tokenUri: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mintStatus: {
      type: DataTypes.ENUM('minted', 'minting', 'unminted'),
      defaultValue: 'unminted',
    },
  });
};
