const { keys } = require('../config');

/* System accounts/private keys per network
   Only testnet accounts commited to source
   @TODO Figure out custody/key management solution and refactor this module
*/
module.exports = {
  5777: [
    {
      account: '0xB91BfC10875f9801D14F402F1b04159bfa774D7C',
      privateKey: keys.ganache,
    },
  ],
  3: [
    {
      account: '0x69887ffcEdC7E45314c956B0f3029B9C804d0158',
      privateKey: keys.ropsten,
    },
  ],
  4: [
    {
      account: '0x69887ffcEdC7E45314c956B0f3029B9C804d0158',
      privateKey: keys.rinkeby,
    },
  ],
};
