const { MemberNft, MemberNftV2 } = require('@zkladder/zkladder-sdk-ts');
const {
  storeVoucher,
  deleteVoucher,
  getAllVouchers,
  getVoucher,
  activateService,
} = require('../../src/services/voucher');
const { ClientError } = require('../../src/utils/error');
const { getAddress, signVoucher, createECDSAKey } = require('../../src/utils/keyManager');
const { memberNftV2Voucher } = require('../../src/utils/vouchers');

jest.mock('../../src/data/postgres/index', () => ({
  voucherModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  contractModel: {
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../src/utils/vouchers', () => ({
  memberNftV1Voucher: jest.fn(),
  memberNftV2Voucher: jest.fn(),
}));

jest.mock('@zkladder/zkladder-sdk-ts', () => ({
  MemberNft: {
    setup: jest.fn(),
  },
  MemberNftV2: {
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

jest.mock('../../src/utils/keyManager', () => ({
  getAddress: jest.fn(),
  signVoucher: jest.fn(),
  createECDSAKey: jest.fn(),
}));

const { voucherModel: mockVoucherModel } = require('../../src/data/postgres/index');
const { contractModel: mockContractModel } = require('../../src/data/postgres/index');

describe('activateService service', () => {
  test('Returns existing key', async () => {
    const mockMemberNft = {
      hasRole: jest.fn(() => (Promise.resolve(true))),
    };

    mockContractModel.findOne.mockResolvedValueOnce({ minterKeyId: 'awsKeyId' });
    getAddress.mockResolvedValueOnce('0xmockminter');
    MemberNftV2.setup.mockResolvedValue(mockMemberNft);

    const result = await activateService({
      verifiedAddress: '0xverifiedAddres',
      contractAddress: '0xmockcontract',
      chainId: '137',
    });

    expect(result).toStrictEqual({
      success: true,
      address: '0xmockminter',
    });

    expect(mockMemberNft.hasRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE', '0xverifiedAddres');
    expect(mockContractModel.findOne).toHaveBeenCalledWith({
      where: { address: '0xmockcontract', chainId: '137' },
    });
    expect(getAddress).toHaveBeenCalledWith('awsKeyId');
  });

  test('Generates new key', async () => {
    const mockMemberNft = {
      hasRole: jest.fn(() => (Promise.resolve(true))),
    };

    mockContractModel.findOne.mockResolvedValueOnce({});
    MemberNftV2.setup.mockResolvedValue(mockMemberNft);
    createECDSAKey.mockResolvedValueOnce({
      keyId: 'awsKeyIdNew',
    });
    getAddress.mockResolvedValueOnce('0xmockminterNew');

    const result = await activateService({
      verifiedAddress: '0xverifiedAddress',
      contractAddress: '0xmockcontract',
      chainId: '137',
    });

    expect(result).toStrictEqual({
      success: true,
      address: '0xmockminterNew',
    });

    expect(mockMemberNft.hasRole).toHaveBeenCalledWith('DEFAULT_ADMIN_ROLE', '0xverifiedAddress');
    expect(mockContractModel.findOne).toHaveBeenCalledWith({
      where: { address: '0xmockcontract', chainId: '137' },
    });
    expect(createECDSAKey).toHaveBeenCalled();
    expect(mockContractModel.update).toHaveBeenCalledWith({
      minterKeyId: 'awsKeyIdNew',
    }, { where: { address: '0xmockcontract', chainId: '137' } });
    expect(getAddress).toHaveBeenCalledWith('awsKeyIdNew');
  });

  test('Throws if caller is unauthorized', async () => {
    const mockMemberNft = {
      hasRole: jest.fn(() => (Promise.resolve(false))),
    };

    MemberNftV2.setup.mockResolvedValue(mockMemberNft);
    createECDSAKey.mockResolvedValueOnce({
      keyId: 'awsKeyIdNew',
    });

    await expect(activateService({
      verifiedAddress: '0xverifiedAddress',
      contractAddress: '0xmockcontract',
      chainId: '137',
    })).rejects.toThrow(new ClientError('Your account is not approved to activate the voucher service'));
  });
});

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
  test('Correctly returns result when V1 voucher exists in DB', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const roleId = 'mockRole';
    const chainId = '137';
    const mockMemberNft = {
      balanceOf: jest.fn(() => (Promise.resolve(0))),
    };

    mockContractModel.findOne.mockResolvedValueOnce({
      templateId: '1',
    });

    mockVoucherModel.findAll.mockResolvedValueOnce([
      { result: 'one', balance: 4 },
      { result: 'two', balance: 100 },
      { result: 'three', balance: 123 },
    ]);

    MemberNft.setup.mockResolvedValue(mockMemberNft);

    const result = await getVoucher({
      contractAddress, userAddress, chainId, roleId,
    });

    expect(mockContractModel.findOne).toHaveBeenCalledWith({
      where: {
        address: '0xmockcontract', chainId: '137',
      },
    });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress: '0xmockuser',
        contractAddress: '0xmockcontract',
        chainId,
        roleId,
      },
      raw: true,
    });

    expect(mockMemberNft.balanceOf).toHaveBeenCalledWith('0xmockUser');

    expect(result).toStrictEqual(
      { result: 'three', balance: 123 },
    );
  });

  test('Correctly returns result when V2 voucher exists in DB', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const roleId = 'mockRole';
    const chainId = '137';
    const mockMemberNft = {
      balanceOf: jest.fn(() => (Promise.resolve(0))),
    };

    mockContractModel.findOne.mockResolvedValueOnce({
      templateId: '3',
    });

    mockVoucherModel.findAll.mockResolvedValueOnce([
      { result: 'one', balance: 4 },
      { result: 'two', balance: 100 },
      { result: 'three', balance: 123 },
    ]);

    MemberNftV2.setup.mockResolvedValue(mockMemberNft);

    const result = await getVoucher({
      contractAddress, userAddress, chainId, roleId,
    });

    expect(mockContractModel.findOne).toHaveBeenCalledWith({
      where: {
        address: '0xmockcontract', chainId: '137',
      },
    });

    expect(mockVoucherModel.findAll).toHaveBeenCalledWith({
      where: {
        userAddress: '0xmockuser',
        contractAddress: '0xmockcontract',
        chainId,
        roleId,
      },
      raw: true,
    });

    expect(mockMemberNft.balanceOf).toHaveBeenCalledWith('0xmockUser');

    expect(result).toStrictEqual(
      { result: 'three', balance: 123 },
    );
  });

  test('Throws when no voucher exists and no minterKeyId in DB', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const roleId = 'mockRole';
    const chainId = '137';
    const mockMemberNft = {
      balanceOf: jest.fn(() => (Promise.resolve(0))),
    };

    mockContractModel.findOne.mockResolvedValueOnce({
      templateId: '3',
    });

    mockVoucherModel.findAll.mockResolvedValueOnce([]);

    MemberNftV2.setup.mockResolvedValue(mockMemberNft);

    await expect(getVoucher({
      contractAddress, userAddress, chainId, roleId,
    })).rejects.toThrow(
      new Error('Voucher service is not enabled'),
    );
  });

  test('Throws if ZKL service does not have mint permissions', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const roleId = 'mockRole';
    const chainId = '137';
    const mockMemberNft = {
      balanceOf: jest.fn(() => (Promise.resolve(0))),
      hasRole: jest.fn(() => (Promise.resolve(false))),
    };

    mockContractModel.findOne.mockResolvedValueOnce({
      templateId: '3', minterKeyId: 'mockAwsId',
    });

    mockVoucherModel.findAll.mockResolvedValueOnce([]);

    MemberNftV2.setup.mockResolvedValue(mockMemberNft);

    getAddress.mockResolvedValue('0xminterAddress');

    await expect(getVoucher({
      contractAddress, userAddress, chainId, roleId,
    })).rejects.toThrow(
      new Error('This account is not approved to mint a token at this contract address'),
    );

    expect(mockMemberNft.hasRole).toHaveBeenCalledWith('MINTER_ROLE', '0xminterAddress');

    expect(getAddress).toHaveBeenCalledWith('mockAwsId');
  });

  test('Correctly returns result', async () => {
    const contractAddress = '0xmockContract';
    const userAddress = '0xmockUser';
    const roleId = 'mockRole';
    const chainId = '137';
    const mockMemberNft = {
      balanceOf: jest.fn(() => (Promise.resolve(0))),
      hasRole: jest.fn(() => (Promise.resolve(true))),
      name: jest.fn(() => (Promise.resolve('mock name'))),
    };

    mockContractModel.findOne.mockResolvedValueOnce({
      templateId: '3', minterKeyId: 'mockAwsId',
    });

    mockVoucherModel.findAll.mockResolvedValueOnce([]);

    MemberNftV2.setup.mockResolvedValue(mockMemberNft);

    getAddress.mockResolvedValue('0xminterAddress');

    memberNftV2Voucher.mockReturnValue('mockVoucher');

    signVoucher.mockResolvedValue('SIGNATURE');

    const result = await getVoucher({
      contractAddress, userAddress, chainId, roleId,
    });

    expect(mockMemberNft.hasRole).toHaveBeenCalledWith('MINTER_ROLE', '0xminterAddress');
    expect(getAddress).toHaveBeenCalledWith('mockAwsId');
    expect(mockMemberNft.name).toHaveBeenCalled();
    expect(memberNftV2Voucher).toHaveBeenCalledWith({
      chainId,
      contractName: 'mock name',
      contractAddress,
      balance: 1,
      tierId: roleId,
      minter: userAddress,
    });
    expect(signVoucher).toHaveBeenCalledWith('mockAwsId', 'mockVoucher');
    expect(result).toStrictEqual({
      balance: 1,
      tierId: roleId,
      minter: userAddress,
      signature: 'SIGNATURE',
    });
  });
});
