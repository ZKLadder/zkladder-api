const {
  validateString, validateNumber, validateBoolean, validateAddress,
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
});
