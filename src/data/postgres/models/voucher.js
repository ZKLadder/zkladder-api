const { DataTypes } = require('sequelize');
const sequelize = require('../index');
const { validateAddress } = require('../../../utils/validators');

const Voucher = sequelize.define('voucher', {
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
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
  userAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEthAddress: (value) => {
        if (!validateAddress(value)) throw new Error('userAddress is not a valid address');
        return value;
      },
    },
  },
});

module.exports = Voucher;
