const mockAccount = {
  999: [
    {
      account: '0x12345678',
      privateKey: '12345678',
    },
  ],
};

const mockNetwork = {
  999: {
    name: 'mockNetwork',
    currency: 'MNW',
    chainId: 999,
    RPCEndpoint: 'Mock rpc endpoint',
  },
};

jest.mock('../../src/data/networkMapping', () => (mockNetwork));
jest.mock('../../src/data/accountMapping', () => (mockAccount));

const { ethers } = require('ethers');

jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn(),
    },
    Wallet: jest.fn(),
  },
}));

jest.mock('../../src/utils/getNetworkById', () => (() => ({ RPCEndpoint: 'test123' })));

const { getAccountByNetworkId, getTransactionSigner } = jest.requireActual('../../src/services/accounts');

describe('getAccountByNetworkId tests', () => {
  test('getAccountByNetworkId returns the correct account when called', () => {
    expect(getAccountByNetworkId(999)).toStrictEqual(mockAccount[999]);
  });

  test('getAccountByNetworkId throws an error when an unknown param is passed', () => {
    expect(() => (getAccountByNetworkId(101))).toThrow(new Error('Requested accounts from unsupported network id'));
  });
});

describe('getTransactionSigner tests', () => {
  test('getTransactionSigner calls underlying services correctly', () => {
    getTransactionSigner(999);
    expect(ethers.providers.JsonRpcProvider).toHaveBeenCalledWith('test123');
    expect(ethers.Wallet).toHaveBeenCalledWith('12345678', {});
  });
});
