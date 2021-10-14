const mockContract = {
  999: {
    name: 'mockContract',
    id: 999,
    src: 'Mock src',
  },
};

jest.mock('../../src/data/contractMapping', () => (mockContract));

const getContractById = require('../../src/contracts/getContractById');

describe('getContractById tests', () => {
  test('getContractById returns the correct contract when called', () => {
    expect(getContractById(999)).toStrictEqual(mockContract[999]);
  });

  test('getContractById throws an error when an unknown param is passed', () => {
    expect(() => (getContractById(101))).toThrow(new Error('Requested unsupported contract id'));
  });
});
