const mockNetwork = {
  999: {
    name: 'mockNetwork',
    currency: 'MNW',
    chainId: 999,
    RPCEndpoint: 'Mock rpc endpoint',
  },
};

jest.mock('../../src/data/networkMapping', () => (mockNetwork));

const getNetworkById = require('../../src/utils/getNetworkById');

describe('getNetworkById tests', () => {
  test('getNetworkById returns the correct network when called', () => {
    expect(getNetworkById(999)).toStrictEqual(mockNetwork[999]);
  });

  test('getNetworkById throws an error when an unknown param is passed', () => {
    expect(() => (getNetworkById(101))).toThrow(new Error('Requested unsupported network id'));
  });
});
