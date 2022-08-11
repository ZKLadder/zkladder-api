const { hasAccess } = require('../../src/utils/signatures');
const authentication = require('../../src/routes/middleware/authentication');
const { ClientError } = require('../../src/utils/error');

jest.mock('../../src/utils/signatures', () => ({
  hasAccess: jest.fn(),
}));

describe('Authentication middleware', () => {
  const mockMessage = 'Mock User Message';
  const mockSignature = 'Mock User Signature';
  const mockReq = {
    headers: {
      'x-user-signature': Buffer.from(`${mockMessage}_${mockSignature}`).toString('base64'),
    },
  };
  const mockRes = {};
  const mockNext = jest.fn();

  test('It correctly calls dependencies', async () => {
    await authentication(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(hasAccess).toHaveBeenCalledWith(Buffer.from(`${mockMessage}_${mockSignature}`).toString('base64'));
  });

  test('It correctly calls next() when signature is valid', async () => {
    hasAccess.mockResolvedValueOnce({ session: true, verifiedAddress: '0x123456' });
    await authentication(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRes.locals.verifiedAddress).toStrictEqual('0x123456');
  });

  test('It correctly calls next() when x-user-signature is missing', async () => {
    await authentication(
      { headers: {} },
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(new ClientError('Missing required x-user-signature header'));
  });

  test('It correctly calls next() when signature is not valid', async () => {
    hasAccess.mockResolvedValueOnce({ session: false });
    await authentication(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(new ClientError('Your Eth account does not have access'));
  });
});
