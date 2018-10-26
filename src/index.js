const claim = require('./core/claim');
const merkletree = require('./merkletree');
const Relay = require('./http/relay');
const KeyContainer = require('./keyContainer/keyContainer');
const Id = require('./id');
const auth = require('./auth/auth');
const Auth = auth.Auth;
const dapp = require('./auth/dapp');
const Dapp = dapp.Dapp;
const utils = require('./utils');

module.exports = {
  claim,
  merkletree,
  KeyContainer,
  Id,
  Relay,
  auth,
  Auth,
  dapp,
  Dapp,
  utils
};
