/* eslint-disable no-underscore-dangle */
const sigUtil = require('@metamask/eth-sig-util');
const { MemberNft } = require('@zkladder/zkladder-sdk-ts');
const { hasAccess } = require('../../src/utils/signatures');

const mockBuffer = jest.fn();
const mockDate = jest.fn();

Object.defineProperty(global, 'Buffer', {
  configurable: true,
  writable: true,
  value: { from: mockBuffer },
});

Object.defineProperty(global, 'Date', {
  configurable: true,
  writable: true,
  value: { now: mockDate },
});

jest.mock('@metamask/eth-sig-util', () => ({
  recoverTypedSignature: jest.fn(),
}));

jest.mock('../../src/services/accounts', () => ({
  getTransactionSigner: jest.fn(),
}));

jest.mock('../../src/utils/conversions', () => ({
  ethToWei: jest.fn(() => ('mockBigNumber')),
}));

jest.mock('@zkladder/zkladder-sdk-ts', () => ({
  MemberNft: {
    setup: jest.fn(),
  },
}));

describe('hasAccess', () => {
  const totalSupply = jest.fn();
  const getAllTokensOwnedBy = jest.fn();
  MemberNft.setup.mockResolvedValue({
    totalSupply,
    getAllTokensOwnedBy,
  });

  test('Correctly calls dependencies and returns true when signature is valid', async () => {
    const content = {
      message: {
        timestamp: 100,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    mockDate.mockReturnValue(101);

    totalSupply.mockResolvedValueOnce(10);
    getAllTokensOwnedBy.mockResolvedValueOnce([{ mock: 'token' }]);

    const result = await hasAccess('mockSignature');

    expect(totalSupply).toHaveBeenCalledTimes(1);
    expect(getAllTokensOwnedBy).toHaveBeenCalledWith('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toStrictEqual({
      session: true,
      verifiedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      memberToken: { mock: 'token', totalSupply: 10 },
    });
  });

  test('Returns false when address does not hold any tokens', async () => {
    const content = {
      message: {
        timestamp: 100,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xmockAddress');

    totalSupply.mockResolvedValueOnce(10);
    getAllTokensOwnedBy.mockResolvedValueOnce([]);

    const result = await hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toStrictEqual({ session: false });
  });

  test('Returns false when timestamp is over 48 hours old', async () => {
    const content = {
      message: {
        timestamp: 100,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    mockDate.mockReturnValue(172899000);

    totalSupply.mockResolvedValueOnce(10);
    getAllTokensOwnedBy.mockResolvedValueOnce([{ mock: 'token' }]);

    const result = await hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toStrictEqual({ session: false });
  });

  test('Returns false when timestamp issued in the future', async () => {
    const content = {
      message: {
        timestamp: 110001,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    mockDate.mockReturnValue(100000);

    totalSupply.mockResolvedValueOnce(10);
    getAllTokensOwnedBy.mockResolvedValueOnce([{ mock: 'token' }]);

    const result = await hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toStrictEqual({ session: false });
  });

  test('Returns true when address does not hold any tokens but is dev whitelisted', async () => {
    const content = {
      message: {
        timestamp: 100,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    totalSupply.mockResolvedValueOnce(10);
    getAllTokensOwnedBy.mockResolvedValueOnce([]);

    const result = await hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toStrictEqual({
      session: true,
      verifiedAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      memberToken: { totalSupply: 10 },
    });
  });
});
