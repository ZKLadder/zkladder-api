const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

const v1 = require('./routes/v1');
const error = require('./routes/middleware/error');
const healthz = require('./routes/healthz');
const logger = require('./utils/logger');
const { postgres } = require('./data/postgres/index');

app.use(express.json());

app.use(cors({
  origin: true, // allow any origin for now
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'Origin', 'Proxy-Authorization', 'X-User-Identity'],
}));

app.use(cookieParser());

app.use('/api/v1', v1);
app.use('/api', healthz);
app.use('/', error);

app.listen(8080);
logger.log(['App listening']);
postgres.sync();
