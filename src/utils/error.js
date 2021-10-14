/* eslint-disable max-classes-per-file */
class ApplicationError extends Error {
  constructor(message, stack) {
    super();
    this.message = message;
    this.httpStatusCode = 500;
    this.stack = stack;
  }
}

class ApplicationErrorWithObject extends ApplicationError {
  constructor(message, object, stack) {
    super(message);
    this.httpStatusCode = 500;
    this.data = object;
    this.stack = stack;
  }
}

class ClientError extends ApplicationError {
  constructor(message) {
    super(message || 'invalid request error');
    this.httpStatusCode = 400;
  }
}

class ClientErrorWithObject extends ApplicationError {
  constructor(message, object, stack) {
    super(message || 'invalid request error');
    this.httpStatusCode = 400;
    this.data = object;
    this.stack = stack;
  }
}

class NotFoundError extends ApplicationError {
  constructor(message) {
    super(message || 'resource not found');
    this.httpStatusCode = 404;
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message) {
    super(message || 'client not authorized');
    this.httpStatusCode = 401;
  }
}

class GenericErrorWithObject extends Error {
  constructor(error, object) {
    super();
    this.message = error.message;
    this.data = object;
    this.stack = error.stack;
  }
}

module.exports = {
  ApplicationError,
  ApplicationErrorWithObject,
  ClientError,
  ClientErrorWithObject,
  NotFoundError,
  UnauthorizedError,
  GenericErrorWithObject,
};
