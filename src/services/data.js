const axios = require('axios');
const config = require('../config');
const { ClientError } = require('../utils/error');

/**
 * Generic request wrapper to query the Covalent blockchain data API ( https://www.covalenthq.com/docs/api )
 * @param {*} options Axios compatible API request configuration options
 * @returns Covalent API data
 */
const request = async (options) => {
  try {
    const response = await axios.request({
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Basic ${Buffer.from(`${config.covalent.apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      baseURL: config.covalent.url,
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error_message || 'API error');
  }
};

const getTransactions = async ({ chainId, address }) => {
  if (!chainId || !address) throw new ClientError('Missing required param');

  const transactions = await request({
    method: 'get',
    url: `/v1/${chainId}/address/${address}/transactions_v2/`,
  });
  return transactions;
};

const getAssetPrices = async ({ tickers }) => {
  if (!tickers) throw new ClientError('Missing required param');

  const prices = await request({
    method: 'get',
    url: '/v1/pricing/tickers/',
    params: {
      tickers,
    },
  });

  return prices;
};

module.exports = {
  getTransactions,
  getAssetPrices,

  // Exported for unit testing
  request,
};
