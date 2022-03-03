const { hasAccess } = require('../utils/signatures');
const { ClientError } = require('../utils/error');

const getSession = async (req) => {
  const signature = req.cookies?.['user-signature'] || req.headers['x-user-signature'];

  if (!signature) return { session: false };

  const session = await hasAccess(signature);

  return session;
};

const createSession = async (req, res) => {
  const { body, hostname } = req;
  const { signature } = body;
  console.log('body', body);
  console.log('hostname', hostname);
  console.log('sig', signature);
  const { session, memberToken } = await hasAccess(signature);
  console.log('session', session, memberToken);
  res.cookie(
    'user-signature',
    signature,
    {
      domain: hostname === 'localhost' ? 'localhost' : '.zkladder.com',
      httpOnly: true,
      expires: new Date(Date.now() + 172800000),
      encode: (cookie) => cookie,
      sameSite: hostname === 'localhost' ? undefined : 'None',
      secure: hostname === 'localhost' ? undefined : true,
    },
  );

  if (!session) throw new ClientError('Your Eth account does not have access');

  return { session, memberToken };
};

const deleteSession = (res) => {
  res.clearCookie('user-signature');
};

module.exports = {
  getSession, createSession, deleteSession,
};
