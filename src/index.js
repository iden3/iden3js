const claim = require('./claim/claim');
const merkleTree = require('./merkle-tree/merkle-tree');
const sparseMerkleTree = require('./sparse-merkle-tree/sparse-merkle-tree');
const Relay = require('./http/relay');
const Db = require('./db/db');
const PrivateFolder = require('./http/private-folder');
const KeyContainer = require('./key-container/key-container');
const Id = require('./id/id');
const dapp = require('./auth/dapp');
const utils = require('./utils');
const auth = require('./auth/auth');
const admin = require('./admin/requests');
const counterfactual = require('./eth/counterfactual');

const { Auth } = auth;
const { Dapp } = dapp;

module.exports = {
  claim,
  merkleTree,
  sparseMerkleTree,
  Db,
  PrivateFolder,
  KeyContainer,
  Id,
  Relay,
  auth,
  Auth,
  dapp,
  Dapp,
  utils,
  admin,
  counterfactual,
};
