const { utils } = require('ethers');
const {
  validateAddress, validateBoolean, validateString, validateNumber,
} = require('./validators');

const contracts = require('../data/constants/contractMapping');

/**
 * Validates a given set of smart contract constructor params against a given ABI
  @param contractABI - ABI of smart contract to validate
  @param constructParams - array of constructor params in the correct order
 */
const validateConstructorParams = (contractABI, constructParams) => {
  const constructor = contractABI.find((func) => func.type === 'constructor');
  if (!constructor) throw new Error('Contract does not have a constructor');
  if (constructor.inputs.length !== constructParams.length) throw new Error('Incorrect number of params');

  constructParams.forEach((param, index) => {
    const abiDefinedType = constructor.inputs?.[index]?.type;
    if (abiDefinedType === 'string' && !validateString(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'bool' && !validateBoolean(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'address' && !validateAddress(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType.includes('uint') && !validateNumber(param)) throw new Error(`Constructor param at index ${index} is not a valid ${abiDefinedType}`);
  });
};

/**
 * Validates a given set of smart contract function params against a given ABI
  @param contractABI - ABI of smart contract to validate
  @param functionName - name of function being called
  @param functionParams - array of function params in the correct order
 */

const validateFunctionParams = (contractABI, functionName, functionParams) => {
  const calledFunction = contractABI.find((func) => func.name === functionName);
  if (!calledFunction) throw new Error(`Contract does not have a function called ${functionName}`);
  if (calledFunction.inputs.length !== functionParams.length) throw new Error('Incorrect number of params');

  functionParams.forEach((param, index) => {
    const abiDefinedType = calledFunction.inputs?.[index]?.type;
    if (abiDefinedType === 'string' && !validateString(param)) throw new Error(`Function param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'bool' && !validateBoolean(param)) throw new Error(`Function param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType === 'address' && !validateAddress(param)) throw new Error(`Function param at index ${index} is not a valid ${abiDefinedType}`);
    else if (abiDefinedType.includes('uint') && !validateNumber(param)) throw new Error(`Function param at index ${index} is not a valid ${abiDefinedType}`);
  });
};

const getContractById = (contractId) => {
  if (!contracts[contractId]) throw new Error('Requested unsupported contract id');
  return contracts[contractId];
};

const abiEncode = (functionName, abi, params) => {
  const abiCoder = new utils.AbiCoder();
  let functionAbi;
  if (functionName === 'constructor') {
    validateConstructorParams(abi, params);
    functionAbi = abi.find((func) => func.type === 'constructor');
  } else {
    validateFunctionParams(abi, functionName, params);
    functionAbi = abi.find((func) => func.name === functionName);
  }

  const types = [];

  functionAbi.inputs.forEach((param) => {
    types.push(param.type);
  });

  return abiCoder.encode(types, params);
};

module.exports = {
  validateConstructorParams,
  validateFunctionParams,
  getContractById,
  abiEncode,
};
