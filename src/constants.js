const utils = require('./utils');

const DBPREFIX = 'i3db-';
const KCPREFIX = 'i3kc-';
const MTPREFIX = 'i3mt-';
const NAMESPACEHASH = utils.hashBytes(Buffer.from('iden3.io'));
const CLAIMS = {
  BASIC: {
    ID: 'basic',
  },
  ASSIGN_NAME: {
    ID: 'assignName',
  },
  AUTHORIZE_KSIGN: {
    ID: 'authorizeKSign',
  },
  SET_ROOT_KEY: {
    ID: 'setRootKey',
  },
};


module.exports = {
  DBPREFIX,
  KCPREFIX,
  MTPREFIX,
  NAMESPACEHASH,
  CLAIMS,
};
