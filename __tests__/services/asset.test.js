const {
  createAssets, getAssets, updateAsset, deleteAssets,
} = require('../../src/services/asset');

const { uid } = require('../../src/utils/conversions');

jest.mock('../../src/data/postgres/index', () => ({
  assetModel: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    where: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../src/utils/conversions', () => ({
  uid: jest.fn(),
}));

const { assetModel: mockAssetModel } = require('../../src/data/postgres/index');

describe('createAsset tests', () => {
  test('Correctly calls dependencies', async () => {
    uid.mockReturnValue('tokenid');
    const options = {
      chainId: 111,
      contractAddress: '0xUPPERCASE',
      assets: [
        { dropId: '1', tokenUri: 'mock1' },
        { dropId: '2', tokenUri: 'mock2' },
        { dropId: '3', tokenUri: 'mock3' },
        { dropId: '4', tokenUri: 'mock4' },
      ],
    };

    await createAssets(options);

    expect(mockAssetModel.bulkCreate).toHaveBeenCalledWith(
      [
        {
          dropId: '1', tokenUri: 'mock1', chainId: 111, contractAddress: '0xuppercase', tokenId: 'tokenid',
        },
        {
          dropId: '2', tokenUri: 'mock2', chainId: 111, contractAddress: '0xuppercase', tokenId: 'tokenid',
        },
        {
          dropId: '3', tokenUri: 'mock3', chainId: 111, contractAddress: '0xuppercase', tokenId: 'tokenid',
        },
        {
          dropId: '4', tokenUri: 'mock4', chainId: 111, contractAddress: '0xuppercase', tokenId: 'tokenid',
        },
      ],
      { validate: true },
    );
  });

  test('Returns the correct response', async () => {
    const options = {
      chainId: 111,
      contractAddress: '0xUPPERCASE',
      assets: [
        { dropId: '1', tokenUri: 'mock1' },
        { dropId: '2', tokenUri: 'mock2' },
        { dropId: '3', tokenUri: 'mock3' },
        { dropId: '4', tokenUri: 'mock4' },
      ],
    };

    mockAssetModel.bulkCreate.mockResolvedValue('test123');
    const result = await createAssets(options);
    expect(result).toStrictEqual({ assets: 'test123' });
  });

  test('Rethrows any errors', async () => {
    const options = {
      chainId: 111,
      contractAddress: '0xUPPERCASE',
      assets: [
        { dropId: '1', tokenUri: 'mock1' },
        { dropId: '2', tokenUri: 'mock2' },
        { dropId: '3', tokenUri: 'mock3' },
        { dropId: '4', tokenUri: 'mock4' },
      ],
    };
    const mockError = new Error('test123');
    mockAssetModel.bulkCreate.mockRejectedValue(mockError);
    await expect(createAssets(options)).rejects.toEqual(mockError);
  });
});

describe('getAssets tests', () => {
  test('Calls model with correct parameters', async () => {
    mockAssetModel.findAll.mockResolvedValue([
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ]);

    await getAssets({});
    expect(mockAssetModel.findAll).toHaveBeenCalledWith({
      where: {},
      raw: true,
    });

    await getAssets({ id: '2' });
    expect(mockAssetModel.findAll).toHaveBeenCalledWith({
      where: {
        id: '2',
      },
      raw: true,
    });

    await getAssets({ dropId: '123', mintStatus: 'unminted' });
    expect(mockAssetModel.findAll).toHaveBeenCalledWith({
      where: {
        dropId: '123',
        mintStatus: 'unminted',
      },
      raw: true,
    });

    await getAssets({ contractAddress: '0x12345', chainId: 111 });
    expect(mockAssetModel.findAll).toHaveBeenCalledWith({
      where: {
        contractAddress: '0x12345',
        chainId: 111,
      },
      raw: true,
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      id: '5',
    };

    mockAssetModel.findAll.mockResolvedValue([
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ]);

    const result = await getAssets(options);

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
    mockAssetModel.findAll.mockRejectedValue(new Error(mockError));
    await expect(getAssets(options)).rejects.toEqual(new Error(mockError));
  });
});

describe('updateAsset tests', () => {
  test('Correctly calls dependencies', async () => {
    const options = {
      id: '0x1234567',
      mintStatus: 'minted',
      extraField: 'field',
    };

    await updateAsset(options);

    expect(mockAssetModel.update).toHaveBeenCalledWith({
      mintStatus: 'minted',
    }, { where: { id: '0x1234567' } });
  });

  test('Returns the correct response', async () => {
    const options = {
      id: '0x1234567',
      mintStatus: 'minted',
      extraField: 'field',
    };
    mockAssetModel.update.mockResolvedValue('test123');
    const result = await updateAsset(options);
    expect(result).toStrictEqual({ success: true });
  });

  test('Rethrows any errors', async () => {
    const options = {
      id: '0x1234567',
      mintStatus: 'minted',
      extraField: 'field',
    };
    const mockError = new Error('test123');
    mockAssetModel.update.mockRejectedValue(mockError);
    await expect(updateAsset(options)).rejects.toEqual(mockError);
  });
});

describe('deleteAsset tests', () => {
  test('Correctly calls dependencies', async () => {
    const options = {
      assetIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };

    await deleteAssets(options);

    expect(mockAssetModel.destroy).toHaveBeenCalledWith({
      where: {
        id: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    });
  });

  test('Returns the correct response', async () => {
    const options = {
      assetIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };

    mockAssetModel.destroy.mockResolvedValue('test123');
    const result = await deleteAssets(options);
    expect(result).toStrictEqual('test123');
  });

  test('Rethrows any errors', async () => {
    const options = {
      assetIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    const mockError = new Error('test123');
    mockAssetModel.destroy.mockRejectedValue(mockError);
    await expect(deleteAssets(options)).rejects.toEqual(mockError);
  });
});
