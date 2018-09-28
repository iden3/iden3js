const claim = require('./core/claim');
const merkletree = require('./merkletree');
const Relay = require('./http/relay');
const KeyContainer = require('./keyContainer');
const Id = require('./id');
const Auth = require('./auth/auth');
const utils = require('./utils');

module.exports = {
  claim,
  merkletree,
  KeyContainer,
  Id,
  Relay,
  Auth,
  utils
};
