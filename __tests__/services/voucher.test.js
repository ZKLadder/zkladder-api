const ethers = require('ethers');
const {
  storeVoucher,
  deleteVoucher,
  getAllVouchers,
  getVoucher,
} = require('../../src/services/voucher');

const { getAccountByNetworkId } = require('../../src/services/accounts');
const { ClientError } = require('../../src/utils/error');
const { generateContractABI } = require('../../src/services/compile');

jest.mock('../../src/data/postgres/models/voucher', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../../src/utils/signatures', () => ({
  nftWhitelistedVoucher: jest.fn(),
}));

jest.mock('../../src/services/compile', () => ({
  generateContractABI: jest.fn(),
}));

jest.mock('../../src/services/accounts', () => ({
  getAccountByNetworkId: jest.fn(),
  getTransactionSigner: jest.fn(),
}));

jest.mock('ethers', () => ({
  Contract: jest.fn(),
  utils: {
    keccak256: jest.fn(),
    toUtf8Bytes: jest.fn(),
  },
}));

const mockVoucherModel = require('../../src/data/postgres/models/voucher');
const { nftWhitelistedVoucher: mockNftWhitelistedVoucher } = require('../../src/utils/signatures');

describe('storeVoucher service', () => {
  test('Calls dependencies correctly', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;
    const signedVoucher = 'MOCKJSON';

    await storeVoucher({
      contractAddress,
      userAddress,
      balance,
      signedVoucher,
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
      signedVoucher,
    });
  });

  test('It throws when a voucher record already exists', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;

    mockVoucherModel.findOne.mockResolvedValueOnce({ exists: true });

    await expect(storeVoucher({
      contractAddress,
      userAddress,
      balance,
    })).rejects.toEqual(new ClientError('This voucher already exists'));
  });

  test('It returns the correct result', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;
    const signedVoucher = 'MOCKJSON';

    mockVoucherModel.create.mockResolvedValueOnce({ mock: 'voucher' });

    const result = await storeVoucher({
      contractAddress,
      userAddress,
      balance,
      signedVoucher,
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

describe('getAllVouchers function', () => {
  test('Calls dependencies correctly and returns response', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';

    mockVoucherModel.findAll.mockResolvedValueOnce({
      mock: 'response',
    });

    const result = await getAllVouchers({ contractAddress, userAddress });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress,
        contractAddress,
      },
      raw: true,
    });

    expect(result).toStrictEqual({
      mock: 'response',
    });
  });
});

describe('getVoucher function', () => {
  test('Calls dependencies correctly and returns result when voucher exists in DB', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';

    mockVoucherModel.findAll.mockResolvedValueOnce([
      { result: 'one', balance: 4 },
      { result: 'two', balance: 100 },
      { result: 'three', balance: 123 },
    ]);

    const result = await getVoucher({ contractAddress, userAddress });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress,
        contractAddress,
      },
      raw: true,
    });

    expect(result).toStrictEqual(
      { result: 'three', balance: 123 },
    );
  });

  test('Calls dependencies and returns result when voucher does NOT exist in DB and autominting is ON', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const chainId = '123';

    mockVoucherModel.findAll.mockResolvedValueOnce([]);
    generateContractABI.mockResolvedValue({ abi: 'mock' });
    getAccountByNetworkId.mockReturnValue([{ account: 'mockAccount' }]);

    jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
      balanceOf: jest.fn().mockResolvedValue({ toNumber: () => (111) }),
      name: jest.fn().mockResolvedValue('Test Name'),
      hasRole: jest.fn().mockResolvedValue(true),
    }));

    mockNftWhitelistedVoucher.mockResolvedValue({ mock: 'Voucher' });

    const result = await getVoucher({ contractAddress, userAddress, chainId });

    expect(result).toStrictEqual({
      contractAddress,
      userAddress,
      balance: 112,
      signedVoucher: { mock: 'Voucher' },
    });
  });

  test('Throws when a mint voucher does not exist in the DB and autominting is disabled', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const chainId = '123';

    mockVoucherModel.findAll.mockResolvedValueOnce([]);
    generateContractABI.mockResolvedValue({ abi: 'mock' });
    getAccountByNetworkId.mockReturnValue([{ account: 'mockAccount' }]);

    jest.spyOn(ethers, 'Contract').mockImplementation(() => ({
      balanceOf: jest.fn().mockResolvedValue({ toNumber: () => (111) }),
      name: jest.fn().mockResolvedValue('Test Name'),
      hasRole: jest.fn().mockResolvedValue(false),
    }));

    await expect(getVoucher({ contractAddress, userAddress, chainId })).rejects.toThrow(
      new ClientError('This account is not approved to mint a token at this contract address'),
    );
  });
});
