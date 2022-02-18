const express = require('express');
const { getSession, createSession, deleteSession } = require('../../services/session');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const response = getSession(req);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    createSession(req, res);
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    deleteSession(res);
    res.send({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
