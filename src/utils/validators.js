const { utils, BigNumber } = require('ethers');

const validateString = (constructParam) => {
  if (typeof constructParam !== 'string') return false;
  return true;
};

const validateNumber = (constructParam) => {
  if (typeof constructParam !== 'number') return false;
  try {
    BigNumber.from(constructParam);
  } catch (error) {
    return false;
  }
  return true;
};

const validateBoolean = (constructParam) => {
  if (typeof constructParam !== 'boolean') return false;
  return true;
};

const validateAddress = (constructParam) => {
  if (typeof constructParam !== 'string') return false;
  if (!utils.isAddress(constructParam)) return false;
  return true;
};

const validateAccessSchema = (accessSchemas) => {
  if (!Array.isArray(accessSchemas)) throw new Error('AccessSchemas must be an array type');
  accessSchemas.forEach((schema, i) => {
    if (schema.operator === 'and' || schema.operator === 'or') return true;
    if (typeof schema.contractAddress !== 'string') throw new Error(`Schema at index ${i} has incorrectly formatted contract address`);
    if (!schema.chainId) throw new Error(`Schema at index ${i} has incorrectly formatted chainId`);
    if (!schema.returnValueTest) throw new Error(`Schema at index ${i} has incorrectly formatted returnValueTest`);
    if (!schema.parameters) throw new Error(`Schema at index ${i} is missing function or method params`);
    if (schema.functionName && !schema.functionAbi) throw new Error(`Schema at index ${i} has incorrectly formatted functionAbi`);
    if (!schema.functionName && !schema.method && !schema.key) throw new Error(`Schema at index ${i} is missing function or method name`);
    return true;
  });

  return true;
};
// TODO reimplement these as the need arises
/* const validateDynamicArray = (constructParam, type) => {
  if (!Array.isArray(constructParam)) return false;
  let valid = true;
  constructParam.forEach((arrayValue) => {
    // 'this' refers to the validator mapping
    if (!this[type](arrayValue)) valid = false;
  });
  return valid;
};

const validateFixedArray = (constructParam, type, length) => {
  if (!Array.isArray(constructParam)) return false;
  if (constructParam.length !== length) return false;
  let valid = true;
  constructParam.forEach((arrayValue) => {
    // 'this' refers to the validator mapping
    if (!this[type](arrayValue)) valid = false;
  });
  return valid;
};

const validateDynamicBytes = (constructParam) => utils.isBytesLike(constructParam);

const validateFixedBytes = (constructParam, length) => {
  if (!utils.isBytesLike(constructParam)) return false;
  if (Array.isArray(constructParam) && constructParam.length > length) return false;
if (typeof constructParam === 'string' && Buffer.byteLength(constructParam) > length) return false;
  return true;
}; */

module.exports = {
  validateString,
  validateBoolean,
  validateAddress,
  validateNumber,
  validateAccessSchema,
};
