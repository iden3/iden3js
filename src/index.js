const claim = require('./claim/claim');
const merkleTree = require('./merkle-tree/merkle-tree');
const Relay = require('./http/relay');
const Db = require('./db/db');
const PrivateFolder = require('./http/private-folder');
const KeyContainer = require('./key-container/key-container');
const Id = require('./id/id');
const dapp = require('./auth/dapp');
const utils = require('./utils');
const auth = require('./auth/auth');
const api = require('./api/api');

const { Auth } = auth;
const { Dapp } = dapp;

module.exports = {
  claim,
  merkleTree,
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
  api,
};
