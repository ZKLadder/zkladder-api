const { validateConstructorParams, validateFunctionParams } = require('../../src/utils/contract');

const {
  validateString, validateBoolean, validateNumber, validateAddress,
} = require('../../src/utils/validators');

const { getContractById } = require('../../src/utils/contract');

jest.mock('../../src/utils/validators', () => ({
  validateString: jest.fn(),
  validateNumber: jest.fn(),
  validateBoolean: jest.fn(),
  validateAddress: jest.fn(),
}));

jest.mock('../../src/data/contractMapping', () => ({
  999: {
    name: 'mockContract',
    id: 999,
    src: 'Mock src',
  },
}));

const mockABIWithConstructor = [
  {
    type: 'constructor',
    inputs: [
      {
        type: 'string',
      },
      {
        type: 'uint256',
      },
      {
        type: 'bool',
      },
      {
        type: 'address',
      },
    ],
  },
];

const mockABIWithFunction = [
  {
    type: 'function',
    name: 'mockFunction',
    inputs: [
      {
        type: 'string',
      },
      {
        type: 'uint256',
      },
      {
        type: 'bool',
      },
      {
        type: 'address',
      },
    ],
  },
];

describe('validateConstructorParams tests', () => {
  test('Passing in invalid ABI fails', () => {
    expect(() => {
      validateConstructorParams(
        [], // ABI
        [], // constructor parameters
      );
    }).toThrow(new Error('Contract does not have a constructor'));
  });

  test('Passing in constructParams with incorrect length fails', () => {
    expect(() => {
      validateConstructorParams(
        mockABIWithConstructor, // ABI
        [1, 2, 3], // constructor parameters
      );
    }).toThrow(new Error('Incorrect number of params'));
  });

  test('Correctly calls validators', () => {
    validateNumber.mockReturnValueOnce(true);
    validateBoolean.mockReturnValueOnce(true);
    validateAddress.mockReturnValueOnce(true);
    validateString.mockReturnValueOnce(true);

    validateConstructorParams(
      mockABIWithConstructor, // ABI
      [1, 2, 3, 4], // constructor parameters
    );
    expect(validateString).toHaveBeenCalledWith(1);
    expect(validateNumber).toHaveBeenCalledWith(2);
    expect(validateBoolean).toHaveBeenCalledWith(3);
    expect(validateAddress).toHaveBeenCalledWith(4);
  });

  test('Throws error if validator return false', () => {
    validateString.mockReturnValueOnce(true);
    validateNumber.mockReturnValueOnce(true);
    validateBoolean.mockReturnValueOnce(false);
    validateAddress.mockReturnValueOnce(true);

    expect(() => {
      validateConstructorParams(
        mockABIWithConstructor, // ABI
        [1, 2, 3, 4], // constructor parameters
      );
    }).toThrow('Constructor param at index 2 is not a valid bool');
  });

  test('Does not throw an error if all validators return true', () => {
    validateString.mockReturnValueOnce(true);
    validateNumber.mockReturnValueOnce(true);
    validateBoolean.mockReturnValueOnce(true);
    validateAddress.mockReturnValueOnce(true);
    expect(() => {
      validateConstructorParams(
        mockABIWithConstructor, // ABI
        [1, 2, 3, 4], // constructor parameters
      );
    }).not.toThrow('Constructor param at index 2 is not a valid bool');
  });
});

describe('validateFunctionParams tests', () => {
  test('Passing in invalid function name fails', () => {
    expect(() => {
      validateFunctionParams(
        [], // ABI
        'Some func', // function name
        [], // constructor parameters
      );
    }).toThrow(new Error('Contract does not have a function called Some func'));
  });

  test('Passing in function params with incorrect length fails', () => {
    expect(() => {
      validateFunctionParams(
        mockABIWithFunction, // ABI
        'mockFunction', // function name
        [1, 2, 3], // constructor parameters
      );
    }).toThrow(new Error('Incorrect number of params'));
  });

  test('Correctly calls validators', () => {
    validateNumber.mockReturnValueOnce(true);
    validateBoolean.mockReturnValueOnce(true);
    validateAddress.mockReturnValueOnce(true);
    validateString.mockReturnValueOnce(true);

    validateFunctionParams(
      mockABIWithFunction, // ABI
      'mockFunction', // function name
      [1, 2, 3, 4], // constructor parameters
    );
    expect(validateString).toHaveBeenCalledWith(1);
    expect(validateNumber).toHaveBeenCalledWith(2);
    expect(validateBoolean).toHaveBeenCalledWith(3);
    expect(validateAddress).toHaveBeenCalledWith(4);
  });

  test('Throws error if validator return false', () => {
    validateString.mockReturnValueOnce(true);
    validateNumber.mockReturnValueOnce(true);
    validateBoolean.mockReturnValueOnce(false);
    validateAddress.mockReturnValueOnce(true);

    expect(() => {
      validateFunctionParams(
        mockABIWithFunction, // ABI
        'mockFunction', // function name
        [1, 2, 3, 4], // constructor parameters
      );
    }).toThrow('Function param at index 2 is not a valid bool');
  });

  test('Does not throw an error if all validators return true', () => {
    validateString.mockReturnValueOnce(true);
    validateNumber.mockReturnValueOnce(true);
    validateBoolean.mockReturnValueOnce(true);
    validateAddress.mockReturnValueOnce(true);
    expect(() => {
      validateFunctionParams(
        mockABIWithFunction, // ABI
        'mockFunction', // function name
        [1, 2, 3, 4], // constructor parameters
      );
    }).not.toThrow('Function param at index 2 is not a valid bool');
  });
});

describe('getContractById tests', () => {
  test('getContractById returns the correct contract when called', () => {
    expect(getContractById(999)).toStrictEqual({
      name: 'mockContract',
      id: 999,
      src: 'Mock src',
    });
  });

  test('getContractById throws an error when an unknown param is passed', () => {
    expect(() => (getContractById(101))).toThrow(new Error('Requested unsupported contract id'));
  });
});
