/* eslint-disable no-underscore-dangle */
const { memberNftV1Voucher, memberNftV2Voucher } = require('../../src/utils/vouchers');
const { ethToWei } = require('../../src/utils/conversions');

jest.mock('../../src/utils/conversions', () => ({
  ethToWei: jest.fn(() => ('mockBigNumber')),
}));

describe('memberNftV1Voucher', () => {
  test('Calls signer with the correct paramaters when wallet is given', async () => {
    const mockWallet = {
      _signTypedData: jest.fn(),
    };

    await memberNftV1Voucher({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      signer: { ...mockWallet },
      wallet: mockWallet,
      balance: 1,
      salePrice: 125,
      minter: '0x987654321',
    });

    expect(ethToWei).toHaveBeenCalledWith(125);

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
          { name: 'salePrice', type: 'uint256' },
          { name: 'minter', type: 'address' },
        ],
      },
      {
        balance: 1,
        minter: '0x987654321',
        salePrice: 'mockBigNumber',
      },
    );
  });

  test('Returns the correct result', async () => {
    const mockWallet = {
      _signTypedData: jest.fn(() => ('0xmockSignature')),
    };

    const result = await memberNftV1Voucher({
      chainId: 123,
      contractName: 'mockContract',
      contractAddress: '0x123456789',
      signer: { ...mockWallet },
      wallet: mockWallet,
      balance: 1,
      minter: '0x987654321',
    });

    expect(result).toStrictEqual({
      balance: 1,
      minter: '0x987654321',
      salePrice: 'mockBigNumber',
      signature: '0xmockSignature',
    });
  });
});

describe('memberNftV2Voucher', () => {
  test('Returns correctly formatted voucher data', async () => {
    const result = memberNftV2Voucher({
      chainId: '137',
      contractName: 'mock name',
      contractAddress: '0x12345678',
      tokenId: 1,
      tierId: 2,
      minter: '0xmockuser',
    });

    expect(result).toStrictEqual({
      domain: {
        chainId: '137',
        name: 'mock name',
        verifyingContract: '0x12345678',
        version: '1',
      },
      types: {
        mintVoucher: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'tierId', type: 'uint32' },
          { name: 'minter', type: 'address' },
        ],
      },
      value: {
        tokenId: 1,
        tierId: 2,
        minter: '0xmockuser',
      },
    });
  });
});
