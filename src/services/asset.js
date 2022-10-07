const { assetModel } = require('../data/postgres/index');
const { ClientError } = require('../utils/error');
const { uid } = require('../utils/conversions');

const createAssets = async (options) => {
  const {
    chainId, contractAddress,
  } = options;

  const assets = options?.assets.map((asset) => ({
    chainId,
    contractAddress: contractAddress.toLowerCase(),
    tokenId: uid(),
    ...asset,
  }));

  const newAssets = await assetModel.bulkCreate([...assets], { validate: true });

  return { assets: newAssets };
};

const getAssets = async (options) => {
  const {
    id, dropId, mintStatus, contractAddress, chainId,
  } = options;

  let where = {};

  if (dropId) {
    where.dropId = dropId;
  }

  if (mintStatus) {
    where.mintStatus = mintStatus;
  }

  if (contractAddress && chainId) {
    where.contractAddress = contractAddress.toLowerCase();
    where.chainId = chainId;
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
    id, mintStatus,
  } = options;

  if (!id) throw new ClientError('id is a required field');

  const updates = {};

  if (mintStatus) updates.mintStatus = mintStatus;

  await assetModel.update(updates,
    { where: { id } });

  return { success: true };
};

module.exports = {
  createAssets, getAssets, deleteAssets, updateAsset,
};
