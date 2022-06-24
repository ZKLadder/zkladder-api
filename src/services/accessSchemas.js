const { accessSchemaModel } = require('../data/postgres/index');
const { ClientError } = require('../utils/error');

const createAccessSchema = async (options) => {
  const {
    creatorAddress, accessSchema, name,
  } = options;

  const newAccessSchema = await accessSchemaModel.create({
    creatorAddress, accessSchema, name,
  });

  return newAccessSchema;
};

const getAccessSchema = async (options) => {
  const { id, creatorAddress } = options;
  const query = {};
  if (id) {
    query.where = {
      id,
    };
  } else if (creatorAddress) {
    query.where = {
      creatorAddress,
    };
  }
  const accessSchemas = await accessSchemaModel.findAll(query);
  return accessSchemas;
};

const updateAccessSchema = async (options) => {
  const {
    id, name, isArchived, accessSchema,
  } = options;

  if (!id) throw new ClientError('id is a required field');

  await accessSchemaModel.update({
    name, isArchived, accessSchema,
  },
  { where: { id } });

  return { success: true };
};

module.exports = { createAccessSchema, getAccessSchema, updateAccessSchema };
