const { Op } = require('sequelize');
const { postgres } = require('../data/postgres/index');
const { contractModel } = require('../data/postgres/index');
const { voucherModel } = require('../data/postgres/index');

const createContract = async (options) => {
  const {
    projectId, chainId, templateId,
  } = options;

  const address = options.address?.toLowerCase();
  const creator = options.creator?.toLowerCase();
  const admins = options.admins?.map((admin) => (admin.toLowerCase()));

  const newContract = await contractModel.create({
    address, projectId, chainId, templateId, creator, admins,
  });

  return newContract;
};

const getContracts = async (options) => {
  const {
    address, projectId, chainId, userAddress,
  } = options;

  const where = {};

  if (address) {
    where.address = address.toLowerCase();
  }

  if (projectId) {
    where.projectId = projectId;
  }

  if (chainId) {
    where.chainId = chainId;
  }

  if (userAddress) {
    where[Op.or] = [
      { creator: { [Op.eq]: userAddress.toLowerCase() } },
      { admins: { [Op.contains]: [userAddress.toLowerCase()] } },
    ];
  }

  const contracts = await contractModel.findAll({
    where,
    attributes: {
      include: [[postgres.fn('COUNT', postgres.col('contractAddress')), 'whitelisted']],
    },
    include: [{
      model: voucherModel,
      attributes: [],
    }],
    group: ['contract.address'],
    raw: true,
  });

  return contracts.map(
    (contract) => ({ ...contract, whitelisted: parseInt(contract.whitelisted, 10) }),
  );
};

module.exports = { createContract, getContracts };
