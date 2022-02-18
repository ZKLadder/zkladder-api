const { getSession, createSession, deleteSession } = require('../../src/services/session');
const { hasAccess } = require('../../src/utils/signatures');

jest.mock('../../src/utils/signatures', () => ({
  hasAccess: jest.fn(),
}));

describe('getSession tests', () => {
  test('getSession correctly calls dependencies and returns result', () => {
    const mockReq = {
      cookies: {
        'user-signature': 'mockSignature',
      },
    };

    hasAccess.mockReturnValueOnce(true);

    const result = getSession(mockReq);

    expect(hasAccess).toHaveBeenCalledWith('mockSignature');
    expect(result).toStrictEqual({ session: true });
  });

  test('getSession returns false when signature is not set', () => {
    const result = getSession({ cookies: {}, headers: {} });

    expect(hasAccess).toHaveBeenCalledTimes(0);
    expect(result).toStrictEqual({ session: false });
  });

  test('getSession returns false when hasAccess returns false', () => {
    const mockReq = {
      cookies: {
        'user-signature': 'mockSignature',
      },
    };

    hasAccess.mockReturnValueOnce(false);

    const result = getSession(mockReq);

    expect(hasAccess).toHaveBeenCalledWith('mockSignature');
    expect(result).toStrictEqual({ session: false });
  });
});

describe('createSession tests', () => {
  test('createSession correctly calls dependencies and returns result', () => {
    const req = {
      body: {
        signature: 'mockSignature',
      },
    };

    const res = {
      cookie: jest.fn(),
    };

    hasAccess.mockReturnValueOnce(true);

    const result = createSession(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'user-signature',
      'mockSignature',
      expect.objectContaining({
        httpOnly: true,
      }),
    );
    expect(result).toBe(undefined);
  });

  test('createSession throws when hasAccess returns false', async () => {
    const req = {
      body: {
        signature: 'mockSignature',
      },
    };

    const res = {
      cookie: jest.fn(),
    };

    hasAccess.mockReturnValueOnce(false);

    try {
      await createSession(req, res);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.message).toStrictEqual('Your Eth account does not have access');
    }
  });
});

describe('deleteSession tests', () => {
  test('deleteSession correctly calls dependencies and returns result', () => {
    const res = {
      clearCookie: jest.fn(),
    };

    const result = deleteSession(res);

    expect(res.clearCookie).toHaveBeenCalledTimes(1);
    expect(result).toBe(undefined);
  });
});
