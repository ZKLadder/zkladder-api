const { Op } = require('sequelize');
const contractModel = require('../data/postgres/models/contract');

const createContract = async (options) => {
  const {
    address, projectId, chainId, templateId, creator, admins,
  } = options;

  const newProject = await contractModel.create({
    address, projectId, chainId, templateId, creator, admins,
  });

  return newProject;
};

const getContracts = async (options) => {
  const {
    address, projectId, chainId, userAddress,
  } = options;
  const query = { where: {} };

  if (address) {
    query.where.address = address;
  }

  if (projectId) {
    query.where.projectId = projectId;
  }

  if (chainId) {
    query.where.chainId = chainId;
  }

  if (userAddress) {
    query.where.creator = userAddress;
    query.where.admins = { [Op.contains]: [userAddress] };
  }
  const contracts = await contractModel.findAll(query);
  return contracts;
};

module.exports = { createContract, getContracts };
