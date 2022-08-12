const {
  createECDSAKey, getPublicKey, getAddress, signVoucher,
} = require('../../src/utils/keyManager');

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(() => ({
      Signature: '0xSIGNATURE',
      PublicKey: 'mockPublicKey',
      KeyMetadata: {
        KeyId: 'mock',
        Arn: 'key',
      },
    })),
  })),
  CreateKeyCommand: jest.fn().mockReturnValue('mockkeycommand'),
  GetPublicKeyCommand: jest.fn().mockReturnValue('mockkeycommand'),
  SignCommand: jest.fn().mockReturnValue('mockkeycommand'),
}));

jest.mock('asn1.js', () => ({
  define: () => ({
    decode: () => ({
      r: '123456789',
      s: '987654321',
      pubKey: {
        data: {
          toString: () => ('mockpublickey'),
        },
      },
    }),
  }),
}));

jest.mock('ethers', () => ({
  utils: {
    joinSignature: () => ('JOINEDSIGNATURE'),
    verifyTypedData: jest.fn(),
    computeAddress: () => ('0x123456789'),
    _TypedDataEncoder: {
      hash: () => ('123456789'),
    },
  },
  BigNumber: {
    from: () => ({
      gt: jest.fn(),
      div: jest.fn(),
      sub: jest.fn(),
    }),
  },
}));

describe('createECDSAKey tests', () => {
  test('Correctly creates key', async () => {
    const result = await createECDSAKey();

    expect(result).toStrictEqual({
      keyId: 'mock',
      keyArn: 'key',
    });
  });
});

describe('getPublicKey tests', () => {
  test('Correctly gets public key', async () => {
    const result = await getPublicKey('12345');

    expect(result).toStrictEqual('0xmockpublickey');
  });
});

describe('getAddress tests', () => {
  test('Correctly gets address', async () => {
    const result = await getAddress('12345');

    expect(result).toStrictEqual('0x123456789');
  });
});

describe('signVoucher tests', () => {
  test('Correctly gets address', async () => {
    const result = await signVoucher('12345', 'voucher');

    expect(result).toStrictEqual('JOINEDSIGNATURE');
  });
});
