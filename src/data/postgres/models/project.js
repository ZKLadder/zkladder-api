const { DataTypes } = require('sequelize');
const { validateAddress } = require('../../../utils/validators');

module.exports = (sequelize) => {
  sequelize.define('project', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING, // image url
      validate: {
        isUrl: true,
      },
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [42],
      },
    },
    admins: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      validate: {
        isEthAddress: (value) => {
          if (!validateAddress(value)) throw new Error('Admins member is not a valid address');
          return value;
        },
      },
    },
  });
};
