const { DataTypes } = require('sequelize');
const { validateAddress } = require('../../../utils/validators');
const getNetworkById = require('../../../utils/getNetworkById');

module.exports = (sequelize) => {
  sequelize.define('voucher', {
    balance: { // Same as balance field of signedVoucher
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    roleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEthAddress: (value) => {
          if (!validateAddress(value)) throw new Error('contractAddress is not a valid address');
          return value;
        },
      },
    },
    userAddress: { // Same as minter field of signedVoucher
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEthAddress: (value) => {
          if (!validateAddress(value)) throw new Error('userAddress is not a valid address');
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
    signedVoucher: { // {balance:number, minter:string, signature:string}
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidVoucher: (value) => {
          if (value.balance
            && value.minter
            && (value.salePrice || value.tierId)
            && value.signature) return value;
          throw new Error('signedVoucher is not formatted correctly');
        },
      },
    },
  });
};
