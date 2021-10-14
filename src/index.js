const express = require('express');

const app = express();

const v1 = require('./routes/v1');
const error = require('./routes/middleware/error');
const healthz = require('./routes/healthz');
const logger = require('./utils/logger');

app.use(express.json());
app.use('/api/v1', v1);
app.use('/api', healthz);
app.use('/', error);

app.listen(8081);
logger.log(['App listening']);

// Contracts folder which extends the entire openZeppelin library DONE
// Solc to import and generate contract ABI DONE
// Truffle contract to deploy contract to specified network with the correct parameters
