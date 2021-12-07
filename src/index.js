const express = require('express');

const app = express();

const v1 = require('./routes/v1');
const error = require('./routes/middleware/error');
const healthz = require('./routes/healthz');
const logger = require('./utils/logger');
const postgres = require('./data/postgres/index');

app.use(express.json());
app.use('/api/v1', v1);
app.use('/api', healthz);
app.use('/', error);

app.listen(8081);
logger.log(['App listening']);
postgres.sync();
