// adds chainId as field in composite private key on contracts
// @TODO Add working framework and documentation for future migrations
module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'contracts',
        'contracts_pkey',
        { transaction },
      );

      await queryInterface.addConstraint(
        'contracts',
        {
          fields: ['address', 'chainId'],
          type: 'primary key',
          name: 'contracts_pkey',
        },
        { transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        'contracts',
        'contracts_pkey',
        { transaction },
      );

      await queryInterface.addConstraint(
        'contracts',
        {
          fields: ['address'],
          type: 'primary key',
          name: 'contracts_pkey',
        },
        { transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
