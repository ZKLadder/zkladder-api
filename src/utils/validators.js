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
};
