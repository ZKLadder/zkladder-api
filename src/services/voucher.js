const { MemberNft, MemberNftV2 } = require('@zkladder/zkladder-sdk-ts');
const { voucherModel, contractModel } = require('../data/postgres/index');
const { ClientError } = require('../utils/error');
const { memberNftV2Voucher } = require('../utils/vouchers');
const { ipfs } = require('../config');
const { createECDSAKey, getAddress, signVoucher } = require('../utils/keyManager');

/**
 * Generates a new signer address unique to the contract in AWS KMS
 * This address must also be granted the 'MINTER_ROLE' client side to complete the circle
 * @param options.verifiedAddress The address of the smart contract where minting will take place
 * @param options.contractAddress The user granted permission to mint
 * @param options.chainId Max user balance allowed after minting has taken place.
 * @returns Minter account address
 */
const activateService = async (options) => {
  const { verifiedAddress, contractAddress, chainId } = options;

  const memberNft = await MemberNftV2.setup({
    address: contractAddress,
    chainId,
    infuraIpfsProjectId: ipfs.projectId,
    infuraIpfsProjectSecret: ipfs.projectSecret,
  });

  // Ensure that the user making the API call is a contract admin
  if (!(await memberNft.hasRole('DEFAULT_ADMIN_ROLE', verifiedAddress))) throw new ClientError('Your account is not approved to activate the voucher service');

  const { minterKeyId } = await contractModel.findOne({
    where: { address: contractAddress, chainId },
  });

  // Return existing minter address if one already exists for this contract
  if (minterKeyId) {
    const address = await getAddress(minterKeyId);
    return { success: true, address };
  }

  const { keyId } = await createECDSAKey();

  await contractModel.update({ minterKeyId: keyId },
    { where: { address: contractAddress, chainId } });

  const address = await getAddress(keyId);

  return { success: true, address };
};

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
    balance, roleId, signedVoucher, chainId,
  } = options;

  const contractAddress = options.contractAddress.toLowerCase();
  const userAddress = options.userAddress.toLowerCase();

  const exists = await voucherModel.findOne({
    where: {
      contractAddress, userAddress, balance, roleId, chainId,
    },
  });

  if (exists) throw new ClientError('This voucher already exists');

  // @TODO validate voucher before storing - i.e signer is MINTER

  const newVoucher = await voucherModel.create({
    contractAddress, userAddress, balance, signedVoucher, roleId, chainId,
  });

  return newVoucher;
};

/**
 * Removes a signed mint voucher from the DB
 */
const deleteVoucher = async (options) => {
  const {
    id, contractAddress, userAddress, balance, chainId, roleId,
  } = options;

  if (id) {
    await voucherModel.destroy({ where: { id } });
    return { success: true };
  }

  if (contractAddress && userAddress && balance && chainId && roleId) {
    await voucherModel.destroy({
      where: {
        contractAddress, userAddress, balance, roleId, chainId,
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
  const contractAddress = options.contractAddress?.toLowerCase();
  const userAddress = options.userAddress?.toLowerCase();
  const { chainId, roleId } = options;

  const where = {};

  if (userAddress) {
    where.userAddress = userAddress;
  }

  if (contractAddress) {
    where.contractAddress = contractAddress;
  }

  if (chainId) {
    where.chainId = chainId;
  }

  if (roleId) {
    where.roleId = roleId;
  }

  const vouchers = await voucherModel.findAll({
    where,
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
  // @TODO Check token gate conditions here

  const {
    userAddress, contractAddress, chainId, roleId,
  } = options;

  const { templateId, minterKeyId } = await contractModel.findOne({
    where: { address: contractAddress.toLowerCase(), chainId },
  });

  let memberNft;
  const setupParams = {
    chainId,
    address: contractAddress,
    infuraIpfsProjectId: ipfs.projectId,
    infuraIpfsProjectSecret: ipfs.projectSecret,
  };

  if (templateId === '1') {
    memberNft = await MemberNft.setup(setupParams);
  } else if (templateId === '3') {
    memberNft = await MemberNftV2.setup(setupParams);
  } else throw new ClientError('Unsupported contract type');

  const minterBalance = await memberNft.balanceOf(userAddress);

  // Get all vouchers and filter out ones that have already been redeemed
  const vouchers = (await getAllVouchers({
    userAddress, contractAddress, chainId, roleId,
  })).filter((voucher) => (voucher.balance > minterBalance));

  if (vouchers.length > 0) {
    // Return the voucher with the highest balance field if it exists
    return vouchers.sort((voucherA, voucherB) => voucherB.balance - voucherA.balance)[0];
  }

  // Detects if automint is enabled (only supported on V2 contracts)
  if (!minterKeyId || templateId !== '3') throw new ClientError('Voucher service is not enabled');

  const minterAddress = await getAddress(minterKeyId);

  const autoMintEnabled = await memberNft.hasRole(
    'MINTER_ROLE',
    minterAddress,
  );

  if (!autoMintEnabled) throw new ClientError('This account is not approved to mint a token at this contract address');

  const contractName = await memberNft.name();

  const voucher = await memberNftV2Voucher({
    chainId,
    contractName,
    contractAddress,
    balance: minterBalance + 1,
    tierId: roleId,
    minter: userAddress,
  });

  const signature = await signVoucher(minterKeyId, voucher);

  return {
    balance: minterBalance + 1,
    tierId: roleId,
    minter: userAddress,
    signature,
  };
};

module.exports = {
  activateService,
  storeVoucher,
  deleteVoucher,
  getAllVouchers,
  getVoucher,
};
