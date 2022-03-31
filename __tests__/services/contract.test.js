const { createContract, getContracts } = require('../../src/services/contract');

jest.mock('../../src/data/postgres/index', () => ({
  postgres: {
    fn: jest.fn(() => ('mockFN')),
    col: jest.fn(),
  },
  contractModel: {
    create: jest.fn(),
    findAll: jest.fn(),
    where: jest.fn(),
  },
  voucherModel: 'mockVoucherModel',
}));

jest.mock('sequelize', () => ({
  Op: { contains: 'contains', or: 'or', eq: 'eq' },
}));

jest.mock('password-generator');

const { contractModel: mockContractModel } = require('../../src/data/postgres/index');

describe('createContract tests', () => {
  test('Correctly calls dependencies', async () => {
    const options = {
      address: '0x1234567',
      projectId: '5632',
      chainId: '123',
      templateId: '3',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
      extraField: 'extra',
    };

    await createContract(options);

    expect(mockContractModel.create).toHaveBeenCalledWith({
      address: '0x1234567',
      projectId: '5632',
      chainId: '123',
      templateId: '3',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      address: '0x1234567',
      projectId: '5632',
      chainId: '123',
      templateId: '3',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
      extraField: 'extra',
    };
    mockContractModel.create.mockResolvedValue('test123');
    const result = await createContract(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      address: '0x1234567',
      projectId: '5632',
      chainId: '123',
      templateId: '3',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
      extraField: 'extra',
    };
    const mockError = new Error('test123');
    mockContractModel.create.mockRejectedValue(mockError);
    await expect(createContract(options)).rejects.toEqual(mockError);
  });
});

describe('getContracts tests', () => {
  test('Calls model with correct parameters', async () => {
    mockContractModel.findAll.mockResolvedValue([
      { contract: 'one', whitelisted: '1' },
      { contract: 'two', whitelisted: '2' },
      { contract: 'three', whitelisted: '3' },
    ]);

    const sequelizeParams = {
      attributes: {
        include: [
          [
            'mockFN',
            'whitelisted',
          ],
        ],
      },
      group: [
        'contract.address',
      ],
      include: [
        {
          attributes: [],
          model: 'mockVoucherModel',
        },
      ],
      raw: true,
    };

    await getContracts({});

    expect(mockContractModel.findAll).toHaveBeenCalledWith({
      ...sequelizeParams,
      where: {},
    });

    const options = {
      address: '0x9',
      projectId: '876543',
      chainId: '3',
      userAddress: '0x0aUSER',
    };

    await getContracts(options);
    expect(mockContractModel.findAll).toHaveBeenCalledWith({
      ...sequelizeParams,
      where: {
        address: '0x9',
        projectId: '876543',
        chainId: '3',
        or: [
          { creator: { eq: '0x0auser' } },
          { admins: { contains: ['0x0auser'] } },
        ],
      },
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      userAddress: '0x0',
    };

    mockContractModel.findAll.mockResolvedValue([
      { contract: 'one', whitelisted: '1' },
      { contract: 'two', whitelisted: '2' },
      { contract: 'three', whitelisted: '3' },
    ]);

    const result = await getContracts(options);

    expect(result).toStrictEqual([
      { contract: 'one', whitelisted: 1 },
      { contract: 'two', whitelisted: 2 },
      { contract: 'three', whitelisted: 3 },
    ]);
  });

  test('Rethrows any errors', async () => {
    const options = {
      userAddress: '0x0',
    };
    const mockError = 'test123';
    mockContractModel.findAll.mockRejectedValue(new Error(mockError));
    await expect(getContracts(options)).rejects.toEqual(new Error(mockError));
  });
});
