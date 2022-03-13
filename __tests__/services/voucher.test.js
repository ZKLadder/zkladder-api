const { MemberNft } = require('@zkladder/zkladder-sdk-ts');
const {
  storeVoucher,
  deleteVoucher,
  getAllVouchers,
  getVoucher,
} = require('../../src/services/voucher');

const { getAccountByNetworkId, getTransactionSigner } = require('../../src/services/accounts');
const { ClientError } = require('../../src/utils/error');

jest.mock('../../src/data/postgres/models/voucher', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../../src/utils/signatures', () => ({
  nftWhitelistedVoucher: jest.fn(),
}));

jest.mock('@zkladder/zkladder-sdk-ts', () => ({
  MemberNft: {
    setup: jest.fn(),
  },
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
    const roleId = 'mockRole';
    const chainId = '123';
    const signedVoucher = 'MOCKJSON';

    await storeVoucher({
      contractAddress,
      userAddress,
      balance,
      roleId,
      chainId,
      signedVoucher,
    });

    expect(mockVoucherModel.findOne).toHaveBeenCalledWith({
      where: {
        contractAddress: '0xmockcontract',
        userAddress: '0xmockuser',
        balance,
        roleId,
        chainId,
      },
    });

    expect(mockVoucherModel.create).toHaveBeenCalledWith({
      contractAddress: '0xmockcontract',
      userAddress: '0xmockuser',
      balance,
      chainId,
      roleId,
      signedVoucher,
    });
  });

  test('It throws when a voucher record already exists', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;
    const roleId = 'mockRole';
    const chainId = '123';

    mockVoucherModel.findOne.mockResolvedValueOnce({ exists: true });

    await expect(storeVoucher({
      contractAddress,
      userAddress,
      balance,
      roleId,
      chainId,
    })).rejects.toEqual(new ClientError('This voucher already exists'));
  });

  test('It returns the correct result', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const balance = 1;
    const chainId = '123';
    const roleId = 'mockRole';
    const signedVoucher = 'MOCKJSON';

    mockVoucherModel.create.mockResolvedValueOnce({ mock: 'voucher' });

    const result = await storeVoucher({
      contractAddress,
      userAddress,
      balance,
      chainId,
      roleId,
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
    const roleId = 'mockRole';
    const chainId = '123';

    const result = await deleteVoucher({
      contractAddress, userAddress, balance, chainId, roleId,
    });

    expect(mockVoucherModel.destroy).toHaveBeenCalledWith({
      where: {
        contractAddress, userAddress, balance, chainId, roleId,
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
    const roleId = 'mockRole';
    const chainId = '123';

    mockVoucherModel.findAll.mockResolvedValueOnce({
      mock: 'response',
    });

    const result = await getAllVouchers({
      contractAddress, userAddress, chainId, roleId,
    });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress: '0xmockuser',
        contractAddress: '0xmockcontract',
        roleId,
        chainId,
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
    const roleId = 'mockRole';

    mockVoucherModel.findAll.mockResolvedValueOnce([
      { result: 'one', balance: 4 },
      { result: 'two', balance: 100 },
      { result: 'three', balance: 123 },
    ]);

    const result = await getVoucher({ contractAddress, userAddress, roleId });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress: '0xmockuser',
        contractAddress: '0xmockcontract',
        roleId,
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
    const roleId = 'mockRole';

    const mockMemberNft = {
      balanceOf: jest.fn(),
      name: jest.fn(),
      getRoleData: jest.fn(),
      hasRole: jest.fn(),
    };

    mockVoucherModel.findAll.mockResolvedValueOnce([]);
    getAccountByNetworkId.mockReturnValue([{ account: '0123456789' }]);
    getTransactionSigner.mockReturnValue({ mock: 'signer' });
    mockMemberNft.balanceOf.mockResolvedValue(111);
    mockMemberNft.name.mockResolvedValue('mockContractName');
    mockMemberNft.getRoleData.mockResolvedValue({ price: 101 });
    mockMemberNft.hasRole.mockResolvedValue(true);
    MemberNft.setup.mockResolvedValueOnce(mockMemberNft);

    mockNftWhitelistedVoucher.mockResolvedValue({ mock: 'Voucher' });

    const result = await getVoucher({
      contractAddress, userAddress, roleId, chainId,
    });

    expect(mockMemberNft.balanceOf).toHaveBeenCalledWith(userAddress);
    expect(mockMemberNft.name).toHaveBeenCalledTimes(1);
    expect(mockMemberNft.getRoleData).toHaveBeenCalledWith('mockRole');
    expect(mockMemberNft.hasRole).toHaveBeenCalledWith('MINTER_ROLE', '0123456789');
    expect(result).toStrictEqual({
      contractAddress: '0xmockContract',
      userAddress: '0xmockUser',
      roleId,
      balance: 112,
      signedVoucher: { mock: 'Voucher' },
    });
  });

  test('Throws when voucher does NOT exist in DB and role is invalid', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const chainId = '123';
    const roleId = 'mockRole';

    const mockMemberNft = {
      balanceOf: jest.fn(),
      name: jest.fn(),
      getRoleData: jest.fn(),
      hasRole: jest.fn(),
    };

    mockVoucherModel.findAll.mockResolvedValueOnce([]);
    getAccountByNetworkId.mockReturnValue([{ account: '0123456789' }]);
    getTransactionSigner.mockReturnValue({ mock: 'signer' });
    mockMemberNft.balanceOf.mockResolvedValue(111);
    mockMemberNft.name.mockResolvedValue('mockContractName');
    mockMemberNft.getRoleData.mockRejectedValue(new Error(`Role with id: ${roleId} not found in contract config`));
    mockMemberNft.hasRole.mockResolvedValue(true);
    MemberNft.setup.mockResolvedValueOnce(mockMemberNft);

    mockNftWhitelistedVoucher.mockResolvedValue({ mock: 'Voucher' });

    await expect(getVoucher({
      contractAddress, userAddress, chainId, roleId,
    })).rejects.toThrow(
      new Error(`Role with id: ${roleId} not found in contract config`),
    );
  });

  test('Throws when a mint voucher does not exist in the DB and autominting is disabled', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const chainId = '123';
    const roleId = 'mockRole';

    const mockMemberNft = {
      balanceOf: jest.fn(),
      name: jest.fn(),
      getRoleData: jest.fn(),
      hasRole: jest.fn(),
    };

    mockVoucherModel.findAll.mockResolvedValueOnce([]);
    getAccountByNetworkId.mockReturnValue([{ account: '0123456789' }]);
    getTransactionSigner.mockReturnValue({ mock: 'signer' });
    mockMemberNft.balanceOf.mockResolvedValue(111);
    mockMemberNft.name.mockResolvedValue('mockContractName');
    mockMemberNft.getRoleData.mockResolvedValue({ price: 101 });
    mockMemberNft.hasRole.mockResolvedValue(false);
    MemberNft.setup.mockResolvedValueOnce(mockMemberNft);

    await expect(getVoucher({
      contractAddress, userAddress, roleId, chainId,
    })).rejects.toThrow(
      new ClientError('This account is not approved to mint a token at this contract address'),
    );
  });
});
