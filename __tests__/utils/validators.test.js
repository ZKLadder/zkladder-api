const {
  validateString, validateNumber, validateBoolean, validateAddress, validateAccessSchema,
} = require('../../src/utils/validators');

describe('Validators tests', () => {
  test('validateString', () => {
    expect(validateString(999)).toStrictEqual(false);
    expect(validateString(true)).toStrictEqual(false);
    expect(validateString(['string'])).toStrictEqual(false);
    expect(validateString({ test: 999 })).toStrictEqual(false);
    expect(validateString('string')).toStrictEqual(true);
  });

  test('validateNumber', () => {
    expect(validateNumber(999)).toStrictEqual(true);
    expect(validateNumber(true)).toStrictEqual(false);
    expect(validateNumber(['string'])).toStrictEqual(false);
    expect(validateNumber({ test: 999 })).toStrictEqual(false);
    expect(validateNumber('string')).toStrictEqual(false);
  });

  test('validateAddress', () => {
    expect(validateAddress(999)).toStrictEqual(false);
    expect(validateAddress(true)).toStrictEqual(false);
    expect(validateAddress(['string'])).toStrictEqual(false);
    expect(validateAddress({ test: 999 })).toStrictEqual(false);
    expect(validateAddress('string')).toStrictEqual(false);
    expect(validateAddress('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7')).toStrictEqual(true);
  });

  test('validateBoolean', () => {
    expect(validateBoolean(999)).toStrictEqual(false);
    expect(validateBoolean(true)).toStrictEqual(true);
    expect(validateBoolean(['string'])).toStrictEqual(false);
    expect(validateBoolean({ test: 999 })).toStrictEqual(false);
    expect(validateBoolean('string')).toStrictEqual(false);
  });

  test('validateAccessSchemas', () => {
    expect(() => { validateAccessSchema({}); }).toThrow(new Error('AccessSchemas must be an array type'));

    expect(() => { validateAccessSchema([{}]); }).toThrow(new Error('Schema at index 0 has incorrectly formatted contract address'));

    expect(() => { validateAccessSchema([{ contractAddress: '12345' }]); }).toThrow(new Error('Schema at index 0 has incorrectly formatted chainId'));

    expect(() => {
      validateAccessSchema([{
        contractAddress: '12345',
        chainId: 31337,
      }]);
    }).toThrow(new Error('Schema at index 0 has incorrectly formatted returnValueTest'));

    expect(() => {
      validateAccessSchema([{
        contractAddress: '12345',
        chainId: 31337,
        returnValueTest: {},
      }]);
    }).toThrow(new Error('Schema at index 0 is missing function or method params'));

    expect(() => {
      validateAccessSchema([{
        contractAddress: '12345',
        chainId: 31337,
        returnValueTest: {},
        parameters: [],
      }]);
    }).toThrow(new Error('Schema at index 0 is missing function or method name'));

    expect(() => {
      validateAccessSchema([{
        contractAddress: '12345',
        chainId: 31337,
        returnValueTest: {},
        parameters: [],
        functionName: 'mockFunction',
      }]);
    }).toThrow(new Error('Schema at index 0 has incorrectly formatted functionAbi'));

    expect(validateAccessSchema([{
      contractAddress: '12345',
      chainId: 31337,
      returnValueTest: {},
      parameters: [],
      functionName: 'mockFunction',
      functionAbi: [],
    }])).toStrictEqual(true);

    expect(validateAccessSchema([{
      contractAddress: '12345',
      chainId: 31337,
      returnValueTest: {},
      parameters: [],
      functionName: 'mockFunction',
      functionAbi: [],
    },
    { operator: 'or' },
    ])).toStrictEqual(true);
  });
});
