const uniqueString = require('password-generator');
const { createProject, getProjects, updateProject } = require('../../src/services/project');
const { ClientError } = require('../../src/utils/error');

jest.mock('../../src/data/postgres/index', () => ({
  projectModel: {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

jest.mock('sequelize', () => ({
  Op: { contains: 'test_query' },
}));

jest.mock('password-generator');

const { projectModel: mockProjectModel } = require('../../src/data/postgres/index');

describe('createProject tests', () => {
  uniqueString.mockReturnValue('uniqueId');
  test('Correctly calls dependencies', async () => {
    const options = {
      name: 'test',
      description: 'test description',
      image: '123',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
      extraField: 'extra',
    };

    await createProject(options);
    expect(uniqueString).toHaveBeenCalledWith(32, false);
    expect(mockProjectModel.create).toHaveBeenCalledWith({
      id: 'uniqueId',
      name: 'test',
      description: 'test description',
      image: '123',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      name: 'test',
      description: 'test description',
      image: '123',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
      extraField: 'extra',
    };
    mockProjectModel.create.mockResolvedValue('test123');
    const result = await createProject(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      name: 'test',
      description: 'test description',
      image: '123',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
      extraField: 'extra',
    };
    const mockError = new Error('test123');
    mockProjectModel.create.mockRejectedValue(mockError);
    await expect(createProject(options)).rejects.toEqual(mockError);
  });
});

describe('getProjects tests', () => {
  test('Calls model with correct parameters', async () => {
    const options = {
      userAddress: '0x0',
    };

    await getProjects(options);
    expect(mockProjectModel.findAll).toHaveBeenCalledWith({
      where: {
        creator: '0x0',
        admins: { test_query: ['0x0'] },
      },
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      userAddress: '0x0',
    };
    mockProjectModel.findAll.mockResolvedValue('test123');
    const result = await getProjects(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      userAddress: '0x0',
    };
    const mockError = 'test123';
    mockProjectModel.findAll.mockRejectedValue(new Error(mockError));
    await expect(getProjects(options)).rejects.toEqual(new Error(mockError));
  });
});

describe('updateProject tests', () => {
  test('Calls model with correct parameters', async () => {
    const options = {
      id: '12345',
      name: 'test',
      description: 'test description',
      image: '123',
      creator: '0x0',
      admins: ['0x0', '0x1', '0x2'],
      extraField: 'extra',
    };

    await updateProject(options);
    expect(mockProjectModel.update).toHaveBeenCalledWith({
      name: 'test',
      description: 'test description',
      image: '123',
      admins: ['0x0', '0x1', '0x2'],
    });
    expect(mockProjectModel.update().where).toHaveBeenCalledWith({
      id: '12345',
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      id: '12345',
      name: 'test',
      description: 'test description',
    };
    mockProjectModel.where.mockResolvedValue('test123');
    const result = await updateProject(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      id: '12345',
      name: 'test',
      description: 'test description',
    };
    const mockError = new Error('test123');
    mockProjectModel.where.mockRejectedValue(mockError);
    await expect(updateProject(options)).rejects.toEqual(mockError);
  });

  test('Throw if id is not defined', async () => {
    const options = {};
    await expect(updateProject(options)).rejects.toEqual(new ClientError('id is a required field'));
  });
});
