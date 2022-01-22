/* eslint-disable no-underscore-dangle */
const sigUtil = require('@metamask/eth-sig-util');
const { nftWhitelistedVoucher, hasAccess } = require('../../src/utils/signatures');
const { getTransactionSigner } = require('../../src/services/accounts');

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

describe('signTypedData for whiteListed NFT tests', () => {
  test('Calls signer with the correct paramaters when wallet is not given', async () => {
    const mockSignTypedData = jest.fn();
    getTransactionSigner.mockReturnValueOnce({
      _signTypedData: mockSignTypedData,
    });

    await nftWhitelistedVoucher({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      balance: 1,
      minter: '0x987654321',
    });

    expect(getTransactionSigner).toHaveBeenCalledWith(123);

    expect(mockSignTypedData).toHaveBeenCalledWith(
      {
        chainId: 123,
        name: 'mockContract',
        verifyingContract: '0x123456789',
        version: '1',
      },
      {
        mintVoucher: [
          { name: 'balance', type: 'uint256' },
          { name: 'minter', type: 'address' },
        ],
      },
      {
        balance: 1,
        minter: '0x987654321',
      },
    );
  });

  test('Calls signer with the correct paramaters when wallet is given', async () => {
    const mockWallet = {
      _signTypedData: jest.fn(),
    };

    await nftWhitelistedVoucher({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      wallet: mockWallet,
      balance: 1,
      minter: '0x987654321',
    });

    expect(getTransactionSigner).not.toHaveBeenCalled();

    expect(mockWallet._signTypedData).toHaveBeenCalledWith(
      {
        chainId: 123,
        name: 'mockContract',
        verifyingContract: '0x123456789',
        version: '1',
      },
      {
        mintVoucher: [
          { name: 'balance', type: 'uint256' },
          { name: 'minter', type: 'address' },
        ],
      },
      {
        balance: 1,
        minter: '0x987654321',
      },
    );
  });

  test('Returns the correct result', async () => {
    const mockWallet = {
      _signTypedData: jest.fn(() => ('0xmockSignature')),
    };

    const result = await nftWhitelistedVoucher({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      wallet: mockWallet,
      balance: 1,
      minter: '0x987654321',
    });

    expect(result).toStrictEqual({
      balance: 1,
      minter: '0x987654321',
      signature: '0xmockSignature',
    });
  });
});

describe('hasAccess', () => {
  test('Correctly calls dependencies and returns true when signature is valid', () => {
    const content = {
      message: {
        timestamp: 100,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    mockDate.mockReturnValue(101);

    const result = hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toBe(true);
  });

  test('Returns false when address is not whitelisted', () => {
    const content = {
      message: {
        timestamp: 100,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xmockAddress');

    const result = hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toBe(false);
  });

  test('Returns false when timestamp is over 48 hours old', () => {
    const content = {
      message: {
        timestamp: 100,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    mockDate.mockReturnValue(172899000);

    const result = hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toBe(false);
  });

  test('Returns false when timestamp issued in the future', () => {
    const content = {
      message: {
        timestamp: 101,
      },
    };

    mockBuffer.mockReturnValueOnce(`${JSON.stringify(content)}_0x123456789`);

    sigUtil.recoverTypedSignature.mockReturnValueOnce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');

    mockDate.mockReturnValue(100);

    const result = hasAccess('mockSignature');

    expect(sigUtil.recoverTypedSignature).toHaveBeenCalledWith({
      data: content,
      signature: '0x123456789',
      version: 'V4',
    });

    expect(result).toBe(false);
  });
});
