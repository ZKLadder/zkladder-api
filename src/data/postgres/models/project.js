const { DataTypes } = require('sequelize');
const sequelize = require('../index');
const { validateAddress } = require('../../../utils/validators');

const Project = sequelize.define('project', {
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

module.exports = Project;
