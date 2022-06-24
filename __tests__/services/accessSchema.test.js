const { createAccessSchema, getAccessSchema, updateAccessSchema } = require('../../src/services/accessSchemas');
const { ClientError } = require('../../src/utils/error');

jest.mock('../../src/data/postgres/index', () => ({
  accessSchemaModel: {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

const { accessSchemaModel: mockAccessSchemaModel } = require('../../src/data/postgres/index');

describe('createAccessSchema tests', () => {
  test('Correctly calls dependencies', async () => {
    const options = {
      creatorAddress: '0x123456789',
      accessSchema: { mock: 'schema' },
      name: 'test',
    };

    await createAccessSchema(options);
    expect(mockAccessSchemaModel.create).toHaveBeenCalledWith(options);
  });

  test('Returns the correct response', async () => {
    const options = {
      creatorAddress: '0x123456789',
      accessSchema: { mock: 'schema' },
      name: 'test',
    };
    mockAccessSchemaModel.create.mockResolvedValue('test123');
    const result = await createAccessSchema(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      creatorAddress: '0x123456789',
      accessSchema: { mock: 'schema' },
      name: 'test',
    };
    const mockError = new Error('test123');
    mockAccessSchemaModel.create.mockRejectedValue(mockError);
    await expect(createAccessSchema(options)).rejects.toEqual(mockError);
  });
});

describe('getAccessSchema tests', () => {
  test('Calls model with creatorAddress', async () => {
    const options = {
      creatorAddress: '0x0',
    };

    await getAccessSchema(options);
    expect(mockAccessSchemaModel.findAll).toHaveBeenCalledWith({
      where: {
        creatorAddress: '0x0',
      },
    });
  });

  test('Calls model with id', async () => {
    const options = {
      id: 1,
    };

    await getAccessSchema(options);
    expect(mockAccessSchemaModel.findAll).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
  });

  test('Calls model with no parameters', async () => {
    const options = {};

    await getAccessSchema(options);
    expect(mockAccessSchemaModel.findAll).toHaveBeenCalledWith({});
  });

  test('Returns the correct response', async () => {
    const options = {
      creatorAddress: '0x0',
    };
    mockAccessSchemaModel.findAll.mockResolvedValue('test123');
    const result = await getAccessSchema(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      creatorAddress: '0x0',
    };
    const mockError = 'test123';
    mockAccessSchemaModel.findAll.mockRejectedValue(new Error(mockError));
    await expect(getAccessSchema(options)).rejects.toEqual(new Error(mockError));
  });
});

describe('updateAccessSchema tests', () => {
  test('Calls model with correct parameters', async () => {
    const options = {
      id: 123,
      accessSchema: { mock: 'schema' },
      name: 'test',
    };

    await updateAccessSchema(options);
    expect(mockAccessSchemaModel.update).toHaveBeenCalledWith({
      accessSchema: { mock: 'schema' },
      name: 'test',
    }, { where: { id: 123 } });
  });

  test('Returns the correct response', async () => {
    const options = {
      id: 123,
      accessSchema: { mock: 'schema' },
      name: 'test',
    };
    mockAccessSchemaModel.where.mockResolvedValue('test123');
    const result = await updateAccessSchema(options);
    expect(result).toStrictEqual({ success: true });
  });

  test('Rethrows any errors', async () => {
    const options = {
      id: 123,
      accessSchema: { mock: 'schema' },
      name: 'test',
    };
    const mockError = new Error('test123');
    mockAccessSchemaModel.update.mockRejectedValue(mockError);
    await expect(updateAccessSchema(options)).rejects.toEqual(mockError);
  });

  test('Throw if id is not defined', async () => {
    const options = {};
    await expect(updateAccessSchema(options)).rejects.toEqual(new ClientError('id is a required field'));
  });
});
