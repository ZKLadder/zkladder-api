const axios = require('axios');
const qs = require('querystring');
const getNetworkById = require('./getNetworkById');

/**
 * Verify contract and etherscan block explorer
 * For a full list of endpoints: https://docs.etherscan.io/
 * @param options input object holding api request parameters
 */
const verify = async (
  chainId,
  sourcecode,
  contractaddress,
  contractname,
  compilerversion,
  constructorArguments,
) => {
  try {
    const { explorerEndpoint, explorerApiKey } = getNetworkById(chainId);
    const response = await axios.request({
      method: 'post',
      url: explorerEndpoint,
      data: qs.stringify({
        apikey: explorerApiKey,
        module: 'contract',
        action: 'verifysourcecode',
        codeformat: 'solidity-single-file',
        sourcecode,
        contractaddress,
        contractname,
        compilerversion,
        optimizationUsed: 0,
        constructorArguments,
        licenseType: 3,
      }),
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'API error');
  }
};

const checkVerification = async (guid, chainId) => {
  try {
    const { explorerEndpoint, explorerApiKey } = getNetworkById(chainId);
    const response = await axios.request({
      method: 'get',
      url: explorerEndpoint,
      params: {
        apikey: explorerApiKey,
        module: 'contract',
        action: 'checkverifystatus',
        guid,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'API error');
  }
};

module.exports = {
  verify,
  checkVerification,
};
