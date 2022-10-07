const { hasAccess, hasAdminRole } = require('../../utils/signatures');
const { ClientError } = require('../../utils/error');

const isZklMember = async (req, res, next) => {
  try {
    const signature = req.cookies?.['user-signature'] || req.headers['x-user-signature'];

    if (!signature) throw new ClientError('Missing required x-user-signature header');

    const { session, verifiedAddress } = await hasAccess(signature);

    if (!session) throw new ClientError('Your account does not have access');

    res.locals = { verifiedAddress };

    next();
  } catch (error) {
    next(error);
  }
};

const isContractAdmin = async (req, res, next) => {
  try {
    const signature = req.cookies?.['user-signature'] || req.headers['x-user-signature'];

    if (!signature) throw new ClientError('Missing required x-user-signature header');

    let chainId;
    let contractAddress;

    if (req.method === 'GET') {
      chainId = req.query.chainId;
      contractAddress = req.query.contractAddress;
    } else {
      chainId = req.body.chainId;
      contractAddress = req.body.contractAddress;
    }

    const { admin, verifiedAddress } = await hasAdminRole(signature, contractAddress, chainId);

    if (!admin) throw new ClientError('Your account does not have access');

    res.locals = { verifiedAddress };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { isZklMember, isContractAdmin };
