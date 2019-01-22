const utils = require('./utils');

const DBPREFIX = 'i3db-';
const KCPREFIX = 'i3kc-';
const IDPREFIX = 'id-';
const KEYPREFIX = 'key-';
const SEEDPREFIX = 'seed-';
const IDMASTERPREFIX = 'idMaster-';
const CLAIMPREFIX = 'claim-';
const MTPREFIX = 'i3mt-';
const NAMESPACEHASH = utils.hashBytes(Buffer.from('iden3.io'));
const CLAIMS = {
  BASIC: {
    ID: 'basic',
    TYPE: 0,
  },
  AUTHORIZE_KSIGN: {
    ID: 'authorizeKSign',
    TYPE: 1,
  },
  SET_ROOT_KEY: {
    ID: 'setRootKey',
    TYPE: 2,
  },
  ASSIGN_NAME: {
    ID: 'assignName',
    TYPE: 3,
  },
  AUTHORIZE_KSIGN_SECP256K1: {
    ID: 'authorizeKSignSecp256k1',
    TYPE: 4,
  },
};

module.exports = {
  IDPREFIX,
  KEYPREFIX,
  SEEDPREFIX,
  IDMASTERPREFIX,
  CLAIMPREFIX,
  DBPREFIX,
  KCPREFIX,
  MTPREFIX,
  NAMESPACEHASH,
  CLAIMS,
};
