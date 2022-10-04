const { dropModel, accessSchemaModel } = require('../data/postgres/index');
const { assetModel } = require('../data/postgres/index');
const { ClientError } = require('../utils/error');

const createDrop = async (options) => {
  const {
    chainId, name, tierId, startTime, endTime, accessSchemaId, totalTokens,
  } = options;

  const contractAddress = options.contractAddress?.toLowerCase();

  const newDrop = await dropModel.create({
    contractAddress, chainId, tierId, name, startTime, endTime, accessSchemaId, totalTokens,
  });

  return newDrop;
};

const getDrops = async (options) => {
  const {
    id, contractAddress, chainId,
  } = options;

  const where = {};

  if (id) {
    where.id = id;
  } else if (contractAddress && chainId) {
    where.contractAddress = contractAddress.toLowerCase();
    where.chainId = chainId;
  }

  const drops = await dropModel.findAll({
    where,
    include: [{
      model: assetModel,
      as: 'assets',
      attributes: ['id', 'dropId', 'tokenUri', 'mintStatus', 'tokenId'],
    },
    {
      model: accessSchemaModel,
      as: 'accessSchema',
    }],
    raw: false,
  });

  return drops;
};

const getDrop = async (id) => {
  const {
    contractAddress, chainId, tierId, name, startTime, endTime,
  } = await dropModel.findOne({
    where: { id },
    raw: true,
  });

  return {
    contractAddress, chainId, tierId, name, startTime, endTime,
  };
};

const updateDrop = async (options) => {
  const {
    id, tierId, name, startTime, endTime, accessSchemaId, totalTokens, isArchived,
  } = options;

  if (!id) throw new ClientError('id is a required field');

  const updates = {};

  if (tierId) updates.tierId = tierId;
  if (name) updates.name = name;
  if (startTime) updates.startTime = startTime;
  if (endTime) updates.endTime = endTime;
  if (accessSchemaId) updates.accessSchemaId = accessSchemaId;
  if (totalTokens) updates.totalTokens = totalTokens;
  if (isArchived) updates.isArchived = isArchived;

  await dropModel.update(updates,
    { where: { id } });

  return { success: true };
};

module.exports = {
  createDrop, getDrops, getDrop, updateDrop,
};
