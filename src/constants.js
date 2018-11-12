const utils = require('./utils');

const PREFIX = 'i3-';
const NAMESPACEHASH = utils.hashBytes(Buffer.from('iden3.io'));

module.exports = {
  PREFIX,
  NAMESPACEHASH
};
