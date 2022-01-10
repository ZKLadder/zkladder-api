/* eslint-disable no-underscore-dangle */
const { nftWhitelisted } = require('../../src/utils/signTypedData');
const { getTransactionSigner } = require('../../src/services/accounts');

jest.mock('../../src/services/accounts', () => ({
  getTransactionSigner: jest.fn(),
}));

describe('signTypedData for whiteListed NFT tests', () => {
  test('Calls signer with the correct paramaters when wallet is not given', async () => {
    const mockSignTypedData = jest.fn();
    getTransactionSigner.mockReturnValueOnce({
      _signTypedData: mockSignTypedData,
    });

    await nftWhitelisted({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      tokenUri: 'http://mock.com',
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
          { name: 'tokenUri', type: 'string' },
          { name: 'balance', type: 'uint256' },
          { name: 'minter', type: 'address' },
        ],
      },
      {
        tokenUri: 'http://mock.com',
        balance: 1,
        minter: '0x987654321',
      },
    );
  });

  test('Calls signer with the correct paramaters when wallet is given', async () => {
    const mockWallet = {
      _signTypedData: jest.fn(),
    };

    await nftWhitelisted({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      wallet: mockWallet,
      tokenUri: 'http://mock.com',
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
          { name: 'tokenUri', type: 'string' },
          { name: 'balance', type: 'uint256' },
          { name: 'minter', type: 'address' },
        ],
      },
      {
        tokenUri: 'http://mock.com',
        balance: 1,
        minter: '0x987654321',
      },
    );
  });

  test('Returns the correct result', async () => {
    const mockWallet = {
      _signTypedData: jest.fn(() => ('0xmockSignature')),
    };

    const result = await nftWhitelisted({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      wallet: mockWallet,
      tokenUri: 'http://mock.com',
      balance: 1,
      minter: '0x987654321',
    });

    expect(result).toStrictEqual({
      tokenUri: 'http://mock.com',
      balance: 1,
      minter: '0x987654321',
      signature: '0xmockSignature',
    });
  });
});
