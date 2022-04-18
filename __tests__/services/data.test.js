const axios = require('axios');
const { request, getTransactions, getAssetPrices } = require('../../src/services/data');
const config = require('../../src/config');
const { ClientError } = require('../../src/utils/error');

jest.mock('axios', () => ({ request: jest.fn() }));
jest.mock('../../src/config', () => ({
  covalent: {
    url: 'https://api.covalenthq.com',
    apiKey: 'mockApiKey',
  },
}));

describe('Generic Covalent API request wrapper', () => {
  test('Calls axios with the correct parameters', async () => {
    axios.request.mockResolvedValueOnce('test');

    await request({
      method: 'get',
      url: 'a/test/url',
    });

    expect(axios.request).toHaveBeenCalledWith({
      method: 'get',
      url: 'a/test/url',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.covalent.apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      baseURL: 'https://api.covalenthq.com',
      withCredentials: true,
    });
  });

  test('Returns response data correctly', async () => {
    axios.request.mockResolvedValueOnce({ data: 'MockData' });

    const response = await request({
      method: 'get',
      url: 'a/test/url',
    });

    expect(response).toStrictEqual('MockData');
  });

  test('Rethrows axios errors correctly', async () => {
    axios.request.mockRejectedValueOnce({
      message: 'Not working',
      config: {
        method: 'get',
        baseURL: 'a/base/url',
        url: 'a/test/url',
      },
    });

    await expect(async () => {
      await request({
        method: 'get',
        url: 'a/test/url',
      });
    }).rejects.toThrow(new Error('API error'));
  });
});

describe('getTransactions tests', () => {
  test('getTransactions correctly calls dependencies and returns correct response', async () => {
    axios.request.mockResolvedValueOnce({ data: { transactions: 'mocked' } });

    const response = await getTransactions({
      address: '0x123456789',
      chainId: '987',
    });

    expect(axios.request).toHaveBeenCalledWith({
      method: 'get',
      url: '/v1/987/address/0x123456789/transactions_v2/',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.covalent.apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      baseURL: 'https://api.covalenthq.com',
      withCredentials: true,
    });

    expect(response).toStrictEqual({ transactions: 'mocked' });
  });

  test('getTransactions throws when given missing params', async () => {
    await expect(async () => {
      await getTransactions({
        address: '0x123456789',
        // Missing chainId
      });
    }).rejects.toThrow(new ClientError('Missing required param'));
  });
});

describe('getAssetPrices tests', () => {
  test('getAssetPrices correctly calls dependencies and returns correct response', async () => {
    axios.request.mockResolvedValueOnce({ data: { prices: 'mocked' } });

    const response = await getAssetPrices({
      tickers: 'ETH',
    });

    expect(axios.request).toHaveBeenCalledWith({
      method: 'get',
      url: '/v1/pricing/tickers/',
      params: {
        tickers: 'ETH',
      },
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.covalent.apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      baseURL: 'https://api.covalenthq.com',
      withCredentials: true,
    });

    expect(response).toStrictEqual({ prices: 'mocked' });
  });

  test('getAssetPrices throws when given missing params', async () => {
    await expect(async () => {
      await getAssetPrices({
        // Missing tickers
      });
    }).rejects.toThrow(new ClientError('Missing required param'));
  });
});
