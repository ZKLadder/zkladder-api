const { hasAccess } = require('../../services/session');
const { ClientError } = require('../../utils/error');

const authentication = (req, res, next) => {
  try {
    const signature = req.cookies?.['user-signature'] || req.headers['x-user-signature'];

    if (!signature) throw new ClientError('Missing required x-user-signature header');
    if (!hasAccess(signature)) throw new ClientError('Your Eth account does not have access');

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authentication;
