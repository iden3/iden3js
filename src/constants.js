const utils = require('./utils');

const DBPREFIX = 'i3db-';
const KCPREFIX = 'i3kc-';
const MTPREFIX = 'i3mt-';
const NAMESPACEHASH = utils.hashBytes(Buffer.from('iden3.io'));

module.exports = {
  DBPREFIX,
  KCPREFIX,
  MTPREFIX,
  NAMESPACEHASH
};
