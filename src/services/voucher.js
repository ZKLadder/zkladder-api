const voucherModel = require('../data/postgres/models/voucher');
const { ClientError } = require('../utils/error');
const { nftWhitelisted } = require('../utils/signTypedData');

const createVoucher = async (options) => {
  const {
    contractAddress, userAddress, balance,
  } = options;

  const exists = await voucherModel.findOne({
    where: { contractAddress, userAddress, balance },
  });

  if (exists) throw new ClientError('This voucher already exists');

  const newVoucher = await voucherModel.create({
    contractAddress, userAddress, balance,
  });

  return newVoucher;
};

const deleteVoucher = async (options) => {
  const {
    id, contractAddress, userAddress, balance,
  } = options;

  if (id) {
    await voucherModel.destroy({ where: { id } });
    return { success: true };
  }

  if (contractAddress && userAddress && balance) {
    await voucherModel.destroy({
      where: { contractAddress, userAddress, balance },
    });
    return { success: true };
  }

  throw new ClientError('Missing required parameters');
};

const getVouchers = async (options) => {
  const { userAddress, contractAddress } = options;

  const vouchers = await voucherModel.findAll({
    where: {
      userAddress,
      contractAddress,
    },
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  return vouchers;
};

const getMostRecentVoucher = async (options) => {
  const { userAddress, contractAddress } = options;

  const vouchers = await getVouchers({ userAddress, contractAddress });

  return vouchers[0];
};

const signVoucher = async (options) => {
  // @TODO Implement logic to enable ERC20, ERC1155 signed vouchers

  const {
    contractAddress,
    tokenUri,
    balance,
    userAddress,

    // @TODO Infer these fields from contract address when contract DB service exists
    chainId,
    contractName,
  } = options;

  const exists = await voucherModel.findOne({
    where: { contractAddress, userAddress, balance },
  });

  if (!exists) throw new ClientError('This account is not approved to mint a token at this contract address');

  const signedVoucher = await nftWhitelisted({
    chainId,
    contractName,
    contractAddress,
    tokenUri,
    balance,
    minter: userAddress,
  });

  return signedVoucher;
};

module.exports = {
  createVoucher,
  deleteVoucher,
  signVoucher,

  // Currently not in use
  getVouchers,
  getMostRecentVoucher,
};
