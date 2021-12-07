const express = require('express');
const { createProject, getProjects, updateProject } = require('../../services/project');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const project = await createProject(req.body);
    res.send(project);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const projects = await getProjects(req.query);
    res.send(projects);
  } catch (error) {
    next(error);
  }
});

router.patch('/', async (req, res, next) => {
  try {
    const project = await updateProject(req.body);
    res.send(project);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
