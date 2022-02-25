const { getSession, createSession, deleteSession } = require('../../src/services/session');
const { hasAccess } = require('../../src/utils/signatures');

jest.mock('../../src/utils/signatures', () => ({
  hasAccess: jest.fn(),
}));

describe('getSession tests', () => {
  test('getSession correctly calls dependencies and returns result', async () => {
    const mockReq = {
      cookies: {
        'user-signature': 'mockSignature',
      },
    };

    hasAccess.mockResolvedValueOnce({ session: true });

    const result = await getSession(mockReq);

    expect(hasAccess).toHaveBeenCalledWith('mockSignature');
    expect(result).toStrictEqual({ session: true });
  });

  test('getSession returns false when signature is not set', async () => {
    const result = await getSession({ cookies: {}, headers: {} });

    expect(hasAccess).toHaveBeenCalledTimes(0);
    expect(result).toStrictEqual({ session: false });
  });

  test('getSession returns false when hasAccess returns false', async () => {
    const mockReq = {
      cookies: {
        'user-signature': 'mockSignature',
      },
    };

    hasAccess.mockResolvedValueOnce({ session: false });

    const result = await getSession(mockReq);

    expect(hasAccess).toHaveBeenCalledWith('mockSignature');
    expect(result).toStrictEqual({ session: false });
  });
});

describe('createSession tests', () => {
  test('createSession correctly calls dependencies and returns result', async () => {
    const req = {
      body: {
        signature: 'mockSignature',
      },
    };

    const res = {
      cookie: jest.fn(),
    };

    hasAccess.mockResolvedValueOnce({ session: true, memberToken: 'mock' });

    const result = await createSession(req, res);

    expect(res.cookie).toHaveBeenCalledWith(
      'user-signature',
      'mockSignature',
      expect.objectContaining({
        httpOnly: true,
      }),
    );
    expect(result).toStrictEqual({ session: true, memberToken: 'mock' });
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

    hasAccess.mockResolvedValueOnce({ session: false });

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
