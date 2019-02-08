const merkleTree = require('./merkle-tree/merkle-tree');
const sparseMerkleTree = require('./sparse-merkle-tree/sparse-merkle-tree');
const smtUtils = require('./sparse-merkle-tree/sparse-merkle-tree-utils');
const Relay = require('./http/relay');
const Db = require('./db/db');
const PrivateFolder = require('./http/private-folder');
const KeyContainer = require('./key-container/key-container');
const Id = require('./id/id');
// const dapp = require('./auth/dapp');
const utils = require('./utils');
const auth = require('./auth/auth');
const admin = require('./admin/requests');
const protocols = require('./protocols/protocols');
const counterfactual = require('./eth/counterfactual');
const constants = require('./constants');

const { Auth } = auth;
// const { Dapp } = dapp;

module.exports = {
  constants,
  merkleTree,
  sparseMerkleTree,
  smtUtils,
  Db,
  PrivateFolder,
  KeyContainer,
  Id,
  Relay,
  auth,
  Auth,
  // dapp,
  // Dapp,
  utils,
  admin,
  protocols,
  counterfactual,
};
