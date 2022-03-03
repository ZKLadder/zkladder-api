const ethers = require('ethers');
const voucherModel = require('../data/postgres/models/voucher');
const { generateContractABI } = require('./compile');
const { ClientError } = require('../utils/error');
const { nftWhitelistedVoucher } = require('../utils/signatures');
const { getAccountByNetworkId, getTransactionSigner } = require('./accounts');

/**
 * Stores a signed mint voucher in the DB for use by the ZKL signer service.
 * Vouchers are generated and signed client side
 * @param options.contractAddress The address of the smart contract where minting will take place
 * @param options.userAddress The user granted permission to mint
 * @param options.balance Max user balance allowed after minting has taken place.
 * @param options.signedVoucher JSON object including data above as well as signature
 * @returns Newly stored voucher
 */
const storeVoucher = async (options) => {
  const {
    balance, signedVoucher, chainId,
  } = options;

  const contractAddress = options.contractAddress.toLowerCase();
  const userAddress = options.userAddress.toLowerCase();

  const exists = await voucherModel.findOne({
    where: {
      contractAddress, userAddress, balance, chainId,
    },
  });

  if (exists) throw new ClientError('This voucher already exists');

  // @TODO validate voucher before storing - i.e signer is MINTER

  const newVoucher = await voucherModel.create({
    contractAddress, userAddress, balance, signedVoucher, chainId,
  });

  return newVoucher;
};

/**
 * Removes a signed mint voucher from the DB
 */
const deleteVoucher = async (options) => {
  const {
    id, contractAddress, userAddress, balance, chainId,
  } = options;

  if (id) {
    await voucherModel.destroy({ where: { id } });
    return { success: true };
  }

  if (contractAddress && userAddress && balance && chainId) {
    await voucherModel.destroy({
      where: {
        contractAddress, userAddress, balance, chainId,
      },
    });
    return { success: true };
  }

  throw new ClientError('Missing required parameters');
};

/**
 * Gets all of {userAddress} vouchers for {contractAddress}
 */
const getAllVouchers = async (options) => {
  const contractAddress = options.contractAddress.toLowerCase();
  const userAddress = options.userAddress.toLowerCase();
  const { chainId } = options;

  const vouchers = await voucherModel.findAll({
    where: {
      userAddress,
      contractAddress,
      chainId,
    },
    raw: true,
  });

  return vouchers;
};

/**
 * Returns a mint voucher generated client side if it exists
 * If a mint voucher does not exist but autominting is enabled, a generates a new will be generated
 * @param options.contractAddress The address of the smart contract where minting will take place
 * @param options.userAddress The user granted permission to mint
 * @param options.chainId Chain where user is requesting mint
 * @returns Mint voucher
 */
const getVoucher = async (options) => {
  // @TODO Implement logic to enable ERC20, ERC1155 signed vouchers

  const { userAddress, contractAddress, chainId } = options;

  const vouchers = await getAllVouchers({ userAddress, contractAddress, chainId });

  if (vouchers.length > 0) {
    // Return the voucher with the highest balance field if it exists
    return vouchers.sort((voucherA, voucherB) => voucherB.balance - voucherA.balance)[0];
  }

  // @TODO Figure out a better place to put this (import ZKL module potentially)
  // Detects if automint is enabled && generates a voucher signed by the signer service
  const { abi } = generateContractABI(3);
  const { account } = getAccountByNetworkId(chainId)[0];
  const signer = getTransactionSigner(chainId);
  const contractAbstraction = new ethers.Contract(contractAddress, abi, signer);

  const minterBalance = (await contractAbstraction.balanceOf(userAddress)).toNumber();
  const contractName = await contractAbstraction.name();
  const autoMintEnabled = await contractAbstraction.hasRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')),
    account,
  );

  if (!autoMintEnabled) throw new ClientError('This account is not approved to mint a token at this contract address');

  const signedVoucher = await nftWhitelistedVoucher({
    chainId,
    contractName,
    contractAddress,
    wallet: signer,
    balance: minterBalance + 1,
    minter: userAddress,
  });

  return {
    contractAddress,
    userAddress,
    balance: minterBalance + 1,
    signedVoucher,
  };
};

module.exports = {
  storeVoucher,
  deleteVoucher,
  getAllVouchers,
  getVoucher,
};
