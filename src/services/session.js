const { hasAccess } = require('../utils/signatures');
const { ClientError } = require('../utils/error');

const getSession = (req) => {
  const signature = req.cookies?.['user-signature'] || req.headers['x-user-signature'];

  if (!signature) return { session: false };
  if (!hasAccess(signature)) return { session: false };

  return { session: true };
};

const createSession = (req, res) => {
  const { body, hostname } = req;
  const { signature } = body;
  if (!hasAccess(signature)) throw new ClientError('Your Eth account does not have access');

  res.cookie(
    'user-signature',
    signature,
    {
      domain: hostname === 'localhost' ? 'localhost' : '.zkladder.com',
      httpOnly: true,
      encode: (cookie) => cookie,
      sameSite: hostname === 'localhost' ? undefined : 'None',
      secure: hostname === 'localhost' ? undefined : true,
    },
  );
};

const deleteSession = (res) => {
  res.clearCookie('user-signature');
};

module.exports = {
  getSession, createSession, deleteSession,
};
