const express = require('express');
const { createProject, getProjects, updateProject } = require('../../services/project');
const authentication = require('../middleware/authentication');

const router = express.Router();

router.post('/', authentication, async (req, res, next) => {
  try {
    const project = await createProject(req.body);
    res.send(project);
  } catch (error) {
    next(error);
  }
});

router.get('/', authentication, async (req, res, next) => {
  try {
    const projects = await getProjects(req.query);
    res.send(projects);
  } catch (error) {
    next(error);
  }
});

router.patch('/', authentication, async (req, res, next) => {
  try {
    const project = await updateProject(req.body);
    res.send(project);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
