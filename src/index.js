const claim = require('./core/claim');
const merkletree = require('./merkletree');
const relay = require('./http/relay');
const Id = require('./id');
const utils = require('./utils');

module.exports = {
  claim,
  merkletree,
  relay,
  Id,
  utils
};
