const utils = require('./utils/utils');

const DB_PREFIX = 'i3db-';
const KC_PREFIX = 'i3kc-';
const MT_PREFIX = 'i3mt-';
const NAMESPACE_HASH = utils.hashBytes(Buffer.from('iden3.io'));
const CLAIMS = {
  TYPES: {
    GENERIC: 'generic',
    KSIGN_CLAIM: 'kSignClaim',
  },
};
const PRIVATE_FOLDER = {
  SELECTORS: {
    DEFAULT: 'byDefault',
    TYPE: 'byType',
    VERSION: 'byVersion',
  },
};

module.exports = {
  CLAIMS,
  DB_PREFIX,
  KC_PREFIX,
  MT_PREFIX,
  NAMESPACE_HASH,
  PRIVATE_FOLDER,
};
