const { accounts, keys } = require('../../config');

/* System accounts/private keys per network
   Only testnet accounts commited to source
   @TODO Figure out custody/key management solution and refactor this module
*/
module.exports = {
  5777: [
    {
      account: accounts.ganache,
      privateKey: keys.ganache,
    },
  ],
  3: [
    {
      account: '0x4a26262236378f0aff37edf6ab7b3ba7452782af',
      privateKey: keys.ropsten,
    },
  ],
  4: [
    {
      account: '0x4a26262236378f0aff37edf6ab7b3ba7452782af',
      privateKey: keys.rinkeby,
    },
  ],
  31337: [
    {
      account: accounts.hardhat,
      privateKey: keys.hardhat,
    },
  ],
};
