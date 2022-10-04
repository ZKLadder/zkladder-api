const { BigNumber, utils } = require('ethers');
const { v4: uuidv4 } = require('uuid');

/**
 * Accepts an Ethers.js BigNumber or string amount in Wei
 * and returns the decimal amount in Eth rounded to the nearest 9 decimal places
 * @param weiAmount
 * @returns Amount in Eth
 */
const weiToEth = (weiAmount) => {
  // string passed in
  if (typeof weiAmount === 'string') {
    return parseFloat(utils.formatUnits(
      weiAmount,
      'ether',
    ));
  }

  // BigNumber passed in
  return parseFloat(utils.formatUnits(
    weiAmount.toString(),
    'ether',
  ));
};

/**
 * Accepts an Ethers.js BigNumber or string amount in Gwei
 * and returns the decimal amount in Eth rounded to the nearest 9 decimal places
 * @param gweiAmount
 * @returns Amount in Eth
 */
const gweiToEth = (gweiAmount) => {
  const pow9 = BigNumber.from(10).pow(9);

  let weiAmount;
  if (typeof gweiAmount === 'string') weiAmount = BigNumber.from(gweiAmount).mul(pow9);
  else weiAmount = gweiAmount.mul(pow9);

  return weiToEth(weiAmount);
};

/**
 * Accepts a JS number in Eth and returns an Ethers.js BigNumber representing that amount in Wei
 * @param ethAmount
 * @returns Ether.js BigNumber in Wei
 */
const ethToWei = (ethAmount) => utils.parseUnits(ethAmount.toString());

/* eslint-disable no-bitwise */
const uid = () => {
  const uniqueId = uuidv4();

  let hash = 0;

  for (let i = 0; i < uniqueId.length; i += 1) {
    const char = uniqueId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;
  }
  return Math.abs(hash);
};

module.exports = {
  weiToEth, gweiToEth, ethToWei, uid,
};
