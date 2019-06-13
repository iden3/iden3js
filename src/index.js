const sparseMerkleTree = require('./sparse-merkle-tree/sparse-merkle-tree');
const smtUtils = require('./sparse-merkle-tree/sparse-merkle-tree-utils');
const Relay = require('./api-client/relay');
const NameServer = require('./api-client/name-server');
const Db = require('./db/db');
const Backup = require('./api-client/private-folder');
const notifications = require('./api-client/notification-server');
const nameResolver = require('./api-client/name-resolver');
const discovery = require('./api-client/discovery');
const KeyContainer = require('./key-container/key-container');
const Id = require('./id/id');
const Identity = require('./identity/identity');
const identityUtils = require('./identity/identity-utils');
const idUtils = require('./id/id-utils');
// const dapp = require('./auth/dapp');
const utils = require('./utils');
const auth = require('./auth/auth');
const admin = require('./admin/requests');
const protocols = require('./protocols/protocols');
const counterfactual = require('./eth/counterfactual');
const constants = require('./constants');
const claim = require('./claim/claim');
const crypto = require('./crypto/crypto');

const { Auth } = auth;
// const { Dapp } = dapp;

module.exports = {
  notifications,
  constants,
  sparseMerkleTree,
  smtUtils,
  Backup,
  KeyContainer,
  Id,
  idUtils,
  Identity,
  identityUtils,
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
  Db,
  crypto,
};
