const merkleTree = require('./merkle-tree/merkle-tree');
const sparseMerkleTree = require('./sparse-merkle-tree/sparse-merkle-tree');
const smtUtils = require('./sparse-merkle-tree/sparse-merkle-tree-utils');
const Relay = require('./http/relay');
const NameServer = require('./http/name-server');
const Db = require('./db/db');
const Backup = require('./http/private-folder');
const NotificationServer = require('./http/notification-server');
const nameResolver = require('./http/name-resolver');
const discovery = require('./http/discovery');
const KeyContainer = require('./key-container/key-container');
const Id = require('./id/id');
// const dapp = require('./auth/dapp');
const utils = require('./utils');
const auth = require('./auth/auth');
const admin = require('./admin/requests');
const protocols = require('./protocols/protocols');
const counterfactual = require('./eth/counterfactual');
const constants = require('./constants');
const claim = require('./claim/claim');

const { Auth } = auth;
// const { Dapp } = dapp;

module.exports = {
  NotificationServer,
  constants,
  merkleTree,
  sparseMerkleTree,
  smtUtils,
  Db,
  Backup,
  KeyContainer,
  Id,
  Relay,
  NameServer,
  auth,
  Auth,
  // dapp,
  // Dapp,
  utils,
  admin,
  protocols,
  counterfactual,
  claim,
  nameResolver,
  discovery,
};
