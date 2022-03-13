const { BigNumber } = require('ethers');
const {
  weiToEth,
  gweiToEth,
  ethToWei,
} = require('../../src/utils/conversions');

describe('weiToEth', () => {
  test('weiToEth correctly converts values', () => {
    const pow18 = BigNumber.from(10).pow(18);
    const pow17 = BigNumber.from(10).pow(17);
    const pow16 = BigNumber.from(10).pow(16);

    const oneEth = BigNumber.from(1).mul(pow18);
    const halfEth = BigNumber.from(5).mul(pow17);
    const quarterEth = BigNumber.from(25).mul(pow16);
    const hundredEth = BigNumber.from(100).mul(pow18);

    const oneEthString = ('1000000000000000000');
    const halfEthString = ('500000000000000000');
    const quarterEthString = ('250000000000000000');
    const hundredEthString = ('100000000000000000000');

    expect(weiToEth(oneEth)).toEqual(1);
    expect(weiToEth(halfEth)).toEqual(0.5);
    expect(weiToEth(quarterEth)).toEqual(0.25);
    expect(weiToEth(hundredEth)).toEqual(100);

    expect(weiToEth(oneEthString)).toEqual(1);
    expect(weiToEth(halfEthString)).toEqual(0.5);
    expect(weiToEth(quarterEthString)).toEqual(0.25);
    expect(weiToEth(hundredEthString)).toEqual(100);
  });
});

describe('gweiToEth', () => {
  test('gweiToEth correctly converts values', () => {
    const pow9 = BigNumber.from(10).pow(9);
    const pow8 = BigNumber.from(10).pow(8);
    const pow7 = BigNumber.from(10).pow(7);

    const oneEth = BigNumber.from(1).mul(pow9);
    const halfEth = BigNumber.from(5).mul(pow8);
    const quarterEth = BigNumber.from(25).mul(pow7);
    const hundredEth = BigNumber.from(100).mul(pow9);

    const oneEthString = ('1000000000');
    const halfEthString = ('500000000');
    const quarterEthString = ('250000000');
    const hundredEthString = ('100000000000');

    expect(gweiToEth(oneEth)).toEqual(1);
    expect(gweiToEth(halfEth)).toEqual(0.5);
    expect(gweiToEth(quarterEth)).toEqual(0.25);
    expect(gweiToEth(hundredEth)).toEqual(100);

    expect(gweiToEth(oneEthString)).toEqual(1);
    expect(gweiToEth(halfEthString)).toEqual(0.5);
    expect(gweiToEth(quarterEthString)).toEqual(0.25);
    expect(gweiToEth(hundredEthString)).toEqual(100);
  });
});

describe('ethToWei', () => {
  test('ethToWei correctly converts values', () => {
    const pow18 = BigNumber.from(10).pow(18);
    const pow17 = BigNumber.from(10).pow(17);
    const pow16 = BigNumber.from(10).pow(16);

    expect(ethToWei(0.25)).toStrictEqual(BigNumber.from(25).mul(pow16));
    expect(ethToWei(1.5)).toStrictEqual(BigNumber.from(15).mul(pow17));
    expect(ethToWei(1)).toStrictEqual(BigNumber.from(1).mul(pow18));
    expect(ethToWei(0.5)).toStrictEqual(BigNumber.from(5).mul(pow17));
  });
});
