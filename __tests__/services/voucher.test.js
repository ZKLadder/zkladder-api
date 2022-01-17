const {
  createVoucher,
  deleteVoucher,
  getVouchers,
  getMostRecentVoucher,
  signVoucher,
} = require('../../src/services/voucher');

const { ClientError } = require('../../src/utils/error');

jest.mock('../../src/data/postgres/models/voucher', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../../src/utils/signatures', () => ({
  nftWhitelisted: jest.fn(),
}));

const mockVoucherModel = require('../../src/data/postgres/models/voucher');
const { nftWhitelisted: mockNftWhitelisted } = require('../../src/utils/signatures');

describe('createVoucher service', () => {
  test('Calls dependencies correctly', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;

    await createVoucher({
      contractAddress,
      userAddress,
      balance,
    });

    expect(mockVoucherModel.findOne).toHaveBeenCalledWith({
      where: {
        contractAddress, userAddress, balance,
      },
    });

    expect(mockVoucherModel.create).toHaveBeenCalledWith({
      contractAddress,
      userAddress,
      balance,
    });
  });

  test('It throws when a voucher record already exists', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;

    mockVoucherModel.findOne.mockResolvedValueOnce({ exists: true });

    await expect(createVoucher({
      contractAddress,
      userAddress,
      balance,
    })).rejects.toEqual(new ClientError('This voucher already exists'));
  });

  test('It returns the correct result', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;

    mockVoucherModel.create.mockResolvedValueOnce({ mock: 'voucher' });

    const result = await createVoucher({
      contractAddress,
      userAddress,
      balance,
    });

    expect(result).toEqual({ mock: 'voucher' });
  });
});

describe('deleteVoucher service', () => {
  test('Calls dependencies correctly when id is passed', async () => {
    const id = 123;

    const result = await deleteVoucher({ id });

    expect(mockVoucherModel.destroy).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(result).toStrictEqual({ success: true });
  });

  test('Calls dependencies correctly when other options are passed', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;

    const result = await deleteVoucher({ contractAddress, userAddress, balance });

    expect(mockVoucherModel.destroy).toHaveBeenCalledWith({
      where: {
        contractAddress, userAddress, balance,
      },
    });

    expect(result).toStrictEqual({ success: true });
  });

  test('It throws when passed incorrect options', async () => {
    await expect(deleteVoucher({}))
      .rejects.toEqual(new ClientError('Missing required parameters'));
  });
});

describe('getVouchers service', () => {
  test('Calls dependencies correctly', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';

    mockVoucherModel.findAll.mockResolvedValueOnce({
      mock: 'response',
    });

    const result = await getVouchers({ contractAddress, userAddress });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress,
        contractAddress,
      },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    expect(result).toStrictEqual({
      mock: 'response',
    });
  });
});

describe('getMostRecentVoucher service', () => {
  test('Calls dependencies correctly', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';

    mockVoucherModel.findAll.mockResolvedValueOnce([
      { result: 'one' },
      { result: 'two' },
      { result: 'three' },
    ]);

    const result = await getMostRecentVoucher({ contractAddress, userAddress });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress,
        contractAddress,
      },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    expect(result).toStrictEqual(
      { result: 'one' },
    );
  });
});

describe('signVoucher service', () => {
  test('Calls dependencies correctly', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const tokenUri = 'https://tokenUri.com';
    const balance = 1;
    const chainId = '123';
    const contractName = 'MockNFT';

    mockVoucherModel.findOne.mockResolvedValueOnce(
      { mock: 'voucher' },
    );

    mockNftWhitelisted.mockResolvedValueOnce(
      { mock: 'result' },
    );

    const result = await signVoucher({
      contractAddress,
      userAddress,
      tokenUri,
      balance,
      chainId,
      contractName,
    });

    expect(mockNftWhitelisted).toHaveBeenCalledWith({
      contractAddress,
      minter: userAddress,
      tokenUri,
      balance,
      chainId,
      contractName,
    });

    expect(result).toStrictEqual(
      { mock: 'result' },
    );
  });

  test('Calls dependencies correctly', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const tokenUri = 'https://tokenUri.com';
    const balance = 1;
    const chainId = '123';
    const contractName = 'MockNFT';

    mockVoucherModel.findOne.mockResolvedValueOnce(undefined);

    await expect(signVoucher({
      contractAddress,
      userAddress,
      tokenUri,
      balance,
      chainId,
      contractName,
    })).rejects.toEqual(new ClientError('This account is not approved to mint a token at this contract address'));

    expect(mockNftWhitelisted).not.toHaveBeenCalled();
  });
});
