const claim = require('./claim/claim');
const GenericClaim = require('./claim/generic/generic');
const AuthorizeKSignClaim = require('./claim/authorize-ksign/authorize-ksign');
const merkleTree = require('./merkle-tree/merkle-tree');
const Relay = require('./relay/relay');
const Db = require('./db/db');
const PrivateFolder = require('./private-folder/private-folder');
const KeyContainer = require('./key-container/key-container');
const Id = require('./id/id');
const dapp = require('./auth/dapp');
const utils = require('./utils/utils');
const auth = require('./auth/auth');

const { Auth } = auth;
const { Dapp } = dapp;

module.exports = {
  claim,
  GenericClaim,
  AuthorizeKSignClaim,
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
};
