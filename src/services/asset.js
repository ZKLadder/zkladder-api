const { assetModel } = require('../data/postgres/index');
const { ClientError } = require('../utils/error');

const createAssets = async (options) => {
  const {
    assets,
  } = options;

  const newAssets = await assetModel.bulkCreate([...assets], { validate: true });

  return newAssets;
};

const getAssets = async (options) => {
  const {
    id, dropId, isMinted,
  } = options;

  let where = {};

  if (dropId) {
    where.dropId = dropId;
  }

  if (isMinted?.toString()) {
    where.isMinted = isMinted;
  }

  if (id) {
    where = { id };
  }

  const assets = await assetModel.findAll({
    where,
    raw: true,
  });

  return assets;
};

const deleteAssets = async (options) => {
  const {
    assetIds,
  } = options;

  const result = await assetModel.destroy({
    where: {
      id: assetIds,
    },
  });

  return result;
};

const updateAsset = async (options) => {
  const {
    id, isMinted,
  } = options;

  if (!id) throw new ClientError('id is a required field');

  const updates = {};

  if (isMinted) updates.isMinted = isMinted;

  await assetModel.update(updates,
    { where: { id } });

  return { success: true };
};

module.exports = {
  createAssets, getAssets, deleteAssets, updateAsset,
};
