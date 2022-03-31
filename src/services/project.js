const { Op } = require('sequelize');
const uniqueString = require('password-generator');
const { projectModel } = require('../data/postgres/index');
const { ClientError } = require('../utils/error');

const createProject = async (options) => {
  const {
    name, description, image, creator, admins,
  } = options;

  const id = uniqueString(32, false);

  const newProject = await projectModel.create({
    id, name, description, image, creator, admins,
  });

  return newProject;
};

const getProjects = async (options) => {
  const { userAddress } = options;
  const query = {};
  if (userAddress) {
    query.where = {
      creator: userAddress,
      admins: { [Op.contains]: [userAddress] },
    };
  }
  const projects = await projectModel.findAll(query);
  return projects;
};

const updateProject = async (options) => {
  const {
    id, name, description, image, admins,
  } = options;

  if (!id) throw new ClientError('id is a required field');

  const updatedProject = await projectModel.update({
    name, description, image, admins,
  }).where({
    id,
  });
  return updatedProject;
};

module.exports = { createProject, getProjects, updateProject };
