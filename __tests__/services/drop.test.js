const { createDrop, getDrops, updateDrop } = require('../../src/services/drop');

jest.mock('../../src/data/postgres/index', () => ({
  dropModel: {
    create: jest.fn(),
    findAll: jest.fn(),
    where: jest.fn(),
    update: jest.fn(),
  },
  assetModel: 'mockAssetModel',
  accessSchemaModel: 'mockAccessSchemaModel',
}));

const { dropModel: mockDropModel } = require('../../src/data/postgres/index');

describe('createDrop tests', () => {
  test('Correctly calls dependencies', async () => {
    const options = {
      contractAddress: '0x1234567',
      chainId: '123',
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
      extraField: 'extra',
    };

    await createDrop(options);

    expect(mockDropModel.create).toHaveBeenCalledWith({
      contractAddress: '0x1234567',
      chainId: '123',
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      contractAddress: '0x1234567',
      chainId: '123',
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
      extraField: 'extra',
    };

    mockDropModel.create.mockResolvedValue('test123');
    const result = await createDrop(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      contractAddress: '0x1234567',
      chainId: '123',
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
      extraField: 'extra',
    };
    const mockError = new Error('test123');
    mockDropModel.create.mockRejectedValue(mockError);
    await expect(createDrop(options)).rejects.toEqual(mockError);
  });
});

describe('getDrops tests', () => {
  test('Calls model with correct parameters', async () => {
    mockDropModel.findAll.mockResolvedValue([
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ]);

    const sequelizeParams = {
      include: [
        {
          model: 'mockAssetModel',
          as: 'assets',
          attributes: ['id', 'dropId', 'tokenUri', 'isMinted'],
        },
        {
          as: 'accessSchema',
          model: 'mockAccessSchemaModel',
        },
      ],
      raw: false,
    };

    await getDrops({});

    expect(mockDropModel.findAll).toHaveBeenCalledWith({
      ...sequelizeParams,
      where: {},
    });

    await getDrops({ id: '2' });
    expect(mockDropModel.findAll).toHaveBeenCalledWith({
      ...sequelizeParams,
      where: {
        id: '2',
      },
    });

    await getDrops({ contractAddress: '0x123', chainId: '123' });
    expect(mockDropModel.findAll).toHaveBeenCalledWith({
      ...sequelizeParams,
      where: {
        contractAddress: '0x123',
        chainId: '123',
      },
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      id: '5',
    };

    mockDropModel.findAll.mockResolvedValue([
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ]);

    const result = await getDrops(options);

    expect(result).toStrictEqual([
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ]);
  });

  test('Rethrows any errors', async () => {
    const options = {
      id: '5',
    };
    const mockError = 'test123';
    mockDropModel.findAll.mockRejectedValue(new Error(mockError));
    await expect(getDrops(options)).rejects.toEqual(new Error(mockError));
  });
});

describe('updateDrop tests', () => {
  test('Correctly calls dependencies', async () => {
    const options = {
      id: '0x1234567',
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
      extraField: 'extra',
    };

    await updateDrop(options);

    expect(mockDropModel.update).toHaveBeenCalledWith({
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
    }, { where: { id: '0x1234567' } });
  });

  test('Returns the correct response', async () => {
    const options = {
      id: '0x1234567',
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
      extraField: 'extra',
    };
    mockDropModel.update.mockResolvedValue('test123');
    const result = await updateDrop(options);
    expect(result).toStrictEqual({ success: true });
  });

  test('Rethrows any errors', async () => {
    const options = {
      id: '0x1234567',
      startTime: 'startTime',
      endTime: 'endTime',
      accessSchemaId: 'ASID',
      totalTokens: 105,
      extraField: 'extra',
    };
    const mockError = new Error('test123');
    mockDropModel.update.mockRejectedValue(mockError);
    await expect(updateDrop(options)).rejects.toEqual(mockError);
  });
});
