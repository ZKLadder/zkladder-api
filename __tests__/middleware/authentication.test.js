const { hasAccess, hasAdminRole } = require('../../src/utils/signatures');
const { isZklMember, isContractAdmin } = require('../../src/routes/middleware/authentication');
const { ClientError } = require('../../src/utils/error');

jest.mock('../../src/utils/signatures', () => ({
  hasAccess: jest.fn(),
  hasAdminRole: jest.fn(),
}));

describe('IsZklMember middleware', () => {
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
    await isZklMember(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(hasAccess).toHaveBeenCalledWith(Buffer.from(`${mockMessage}_${mockSignature}`).toString('base64'));
  });

  test('It correctly calls next() when signature is valid', async () => {
    hasAccess.mockResolvedValueOnce({ session: true, verifiedAddress: '0x123456' });
    await isZklMember(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRes.locals.verifiedAddress).toStrictEqual('0x123456');
  });

  test('It correctly calls next() when x-user-signature is missing', async () => {
    await isZklMember(
      { headers: {} },
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(new ClientError('Missing required x-user-signature header'));
  });

  test('It correctly calls next() when signature is not valid', async () => {
    hasAccess.mockResolvedValueOnce({ session: false });
    await isZklMember(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(new ClientError('Your account does not have access'));
  });
});

describe('IsContractAdmin middleware', () => {
  const mockMessage = 'Mock User Message';
  const mockSignature = 'Mock User Signature';
  const mockReq = {
    method: 'POST',
    body: {
      chainId: 111,
      contractAddress: '0xmockaddress',
    },
    headers: {
      'x-user-signature': Buffer.from(`${mockMessage}_${mockSignature}`).toString('base64'),
    },
  };
  const mockReqGet = {
    method: 'GET',
    query: {
      chainId: 111,
      contractAddress: '0xmockaddress',
    },
    headers: {
      'x-user-signature': Buffer.from(`${mockMessage}_${mockSignature}`).toString('base64'),
    },
  };
  const mockRes = {};
  const mockNext = jest.fn();

  test('It correctly calls dependencies', async () => {
    await isContractAdmin(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(hasAdminRole).toHaveBeenCalledWith(Buffer.from(`${mockMessage}_${mockSignature}`).toString('base64'), '0xmockaddress', 111);
  });

  test('It correctly calls next() when signature is valid', async () => {
    hasAdminRole.mockResolvedValueOnce({ admin: true, verifiedAddress: '0x123456' });
    await isContractAdmin(
      mockReqGet,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRes.locals.verifiedAddress).toStrictEqual('0x123456');
  });

  test('It correctly calls next() when signature is valid and method is not get', async () => {
    hasAdminRole.mockResolvedValueOnce({ admin: true, verifiedAddress: '0x123456' });
    await isContractAdmin(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockRes.locals.verifiedAddress).toStrictEqual('0x123456');
  });

  test('It correctly calls next() when x-user-signature is missing', async () => {
    await isContractAdmin(
      { headers: {} },
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(new ClientError('Missing required x-user-signature header'));
  });

  test('It correctly calls next() when signature is not valid', async () => {
    hasAdminRole.mockResolvedValueOnce({ session: false });
    await isContractAdmin(
      mockReq,
      mockRes,
      mockNext,
    );
    expect(mockNext).toHaveBeenCalledWith(new ClientError('Your account does not have access'));
  });
});
