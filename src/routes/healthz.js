const express = require('express');

const router = express.Router();

router.get('/healthz', (req, res) => {
  res.send('Application healthy');
});

module.exports = router;
