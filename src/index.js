const claim = require('./core/claim');
const merkleTree = require('./merkle-tree');
const Relay = require('./http/relay');
const Db = require('./db');
const Backup = require('./backup');
const KeyContainer = require('./key-container/key-container');
const Id = require('./id');
const dapp = require('./auth/dapp');
const utils = require('./utils');
const auth = require('./auth/auth');

const {Auth} = auth;
const {Dapp} = dapp;

module.exports = {
  claim,
  merkleTree,
  Db,
  Backup,
  KeyContainer,
  Id,
  Relay,
  auth,
  Auth,
  dapp,
  Dapp,
  utils
};
