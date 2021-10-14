const Logger = require('../../utils/logger');

const errorHandler = (error, req, res, next) => {
  const requestData = {
    requestIp: req.ip,
    requestMethod: req.method,
    requestPath: req.originalUrl,
    requestParams: req.query,
    requestBody: req.body,
  };

  Logger.error(error, [requestData]);

  const stack = error.stack || `${error.toString()} - no stack traces`;
  res.status(error.httpStatusCode || 500).send({ ...error, stack });
  next();
};

module.exports = errorHandler;
