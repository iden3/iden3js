const utils = require('./utils');

const DBPREFIX = 'i3db-';
const KCPREFIX = 'i3kc';
const IDPREFIX = 'id-';
const KEYPREFIX = 'keys-';
const IDRECOVERYPREFIX = 'idRecovery';
const PUBKEYBACKUP = 'pubKeyBackup';
const CLAIMPREFIX = 'claim-';
const MTPREFIX = 'i3mt-';

const NAMESPACEHASH = utils.hashBytes(Buffer.from('iden3.io'));

module.exports = {
  PUBKEYBACKUP,
  IDRECOVERYPREFIX,
  IDPREFIX,
  KEYPREFIX,
  CLAIMPREFIX,
  DBPREFIX,
  KCPREFIX,
  MTPREFIX,
  NAMESPACEHASH,
};
