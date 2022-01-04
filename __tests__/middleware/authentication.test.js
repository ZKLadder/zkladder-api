const { utils } = require('ethers');
const authentication = require('../../src/routes/middleware/authentication');
const { ClientError } = require('../../src/utils/error');

jest.mock('ethers', () => ({
  utils: {
    verifyMessage: jest.fn(),
  },
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
    expect(utils.verifyMessage).toHaveBeenCalledWith(mockMessage, mockSignature);
  });

  test('It correctly calls next() when signature is valid', async () => {
    utils.verifyMessage.mockReturnValue('0x69887ffcEdC7E45314c956B0f3029B9C804d0158');
    await authentication(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith();
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
    utils.verifyMessage.mockReturnValue('0x123456789');
    await authentication(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(new ClientError('Your Eth account does not have access'));
  });
});
