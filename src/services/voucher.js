/* eslint-disable prefer-destructuring */
const { MemberNft, MemberNftV2, AccessValidator } = require('@zkladder/zkladder-sdk-ts');
const sigUtil = require('@metamask/eth-sig-util');
const Sequelize = require('sequelize');
const {
  voucherModel, contractModel, assetModel, postgres,
} = require('../data/postgres/index');
const { ClientError } = require('../utils/error');
const { memberNftV2Voucher } = require('../utils/vouchers');
const { ipfs } = require('../config');
const { createECDSAKey, getAddress, signVoucher } = require('../utils/keyManager');
const { getDrops } = require('./drop');
const { getContracts } = require('./contract');

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
    return { success: true, address, minterKeyId };
  }

  const { keyId } = await createECDSAKey();

  await contractModel.update({ minterKeyId: keyId },
    { where: { address: contractAddress, chainId } });

  const address = await getAddress(keyId);

  return { success: true, address, minterKeyId: keyId };
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

  const { templateId } = await contractModel.findOne({
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

  throw new ClientError('This account is not approved to mint a token at this contract address');
};

const requestVoucher = async (options) => {
  const { signature, dropId } = options;

  if (!signature) throw new ClientError('Missing required x-user-signature header');

  let content;
  let digest;

  try {
    const decodedSignature = Buffer.from(signature, 'base64').toString('ascii').split('_');
    content = JSON.parse(decodedSignature[0]);
    digest = decodedSignature[1];
  } catch (err) {
    throw new ClientError('Signature malformed');
  }

  const verifiedAddress = sigUtil.recoverTypedSignature({
    data: content,
    signature: digest,
    version: 'V4',
  });

  const [drop] = await getDrops({ id: dropId });

  if (!drop) throw new ClientError('Unknown dropId');

  const {
    accessSchema, startTime, endTime, assets, contractAddress, chainId, tierId,
  } = drop;

  const [contract] = await getContracts({ chainId, contractAddress });

  const accessValidator = new AccessValidator(accessSchema?.accessSchema);

  const qualifies = (await accessValidator.validate(verifiedAddress))
 && (!endTime || Date.now() < new Date(endTime).getMilliseconds())
 && (!startTime || Date.now() > new Date(startTime).getMilliseconds());

  if (!qualifies) throw new ClientError('You are not eligible to mint');

  const nextAsset = assets.filter(
    (asset) => (asset.mintStatus === 'unminted'),
  ).sort((asset1, asset2) => (asset1.id - asset2.id))[0];

  if (!nextAsset) throw new ClientError('All tokens are minted');

  await postgres.transaction(
    { isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async () => {
      await assetModel.update({ mintStatus: 'minting' },
        {
          where: { id: nextAsset.id },
        });
    },
  );

  const memberNft = await MemberNftV2.setup({
    chainId,
    address: contractAddress,
    infuraIpfsProjectId: ipfs.projectId,
    infuraIpfsProjectSecret: ipfs.projectSecret,
  });

  const contractName = await memberNft.name();

  const voucher = memberNftV2Voucher({
    chainId,
    contractName,
    contractAddress,
    tokenId: nextAsset.tokenId,
    tierId,
    minter: verifiedAddress,
  });

  const signedVoucher = await signVoucher(contract.minterKeyId, voucher);

  return {
    assetId: nextAsset.id,
    tokenUri: nextAsset.tokenUri,
    voucher: {
      tokenId: nextAsset.tokenId,
      tierId,
      minter: verifiedAddress,
      signature: signedVoucher,
    },
  };
};

module.exports = {
  activateService,
  storeVoucher,
  deleteVoucher,
  getAllVouchers,
  getVoucher,
  requestVoucher,
};
