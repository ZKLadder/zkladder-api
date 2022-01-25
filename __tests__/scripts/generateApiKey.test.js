const sigUtil = require('@metamask/eth-sig-util');
const { generateKey } = require('../../scripts/generateApiKey');
const { getAccountByNetworkId } = require('../../src/services/accounts');

Object.defineProperty(global, 'Date', {
  configurable: true,
  writable: true,
  value: { now: () => (123456789) },
});

jest.mock('@metamask/eth-sig-util', () => ({
  signTypedData: jest.fn(),
}));

jest.mock('../../src/services/accounts', () => ({
  getAccountByNetworkId: jest.fn(),
}));

describe('generateKey tests', () => {
  test('generateKey returns a correctly formatted string', async () => {
    const jsonContents = {
      domain: {
        name: 'zkladder.com',
        version: '1',
      },
      message: {
        content: 'Hello from your friends at ZKLadder. Please accept this signature request to get started',
        timestamp: 123456789,
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
        ],
        message: [
          { name: 'content', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
      primaryType: 'message',
    };

    getAccountByNetworkId.mockReturnValue([{ privateKey: '0x123456789' }]);
    sigUtil.signTypedData.mockResolvedValue('0xMockSignature');

    const result = await generateKey();

    expect(sigUtil.signTypedData).toHaveBeenCalledWith({
      data: jsonContents,
      privateKey: Buffer.from('0x123456789', 'hex'),
      version: 'V4',
    });

    expect(result).toEqual(Buffer.from(`${JSON.stringify(jsonContents)}_0xMockSignature`).toString('base64'));
  });
});
