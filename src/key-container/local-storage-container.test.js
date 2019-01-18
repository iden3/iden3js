const chai = require('chai');
const bip39 = require('bip39');
const Db = require('../db/db');
const LocalStorageContainer = require('./local-storage-container');

const { expect } = chai;

describe('[Local-storage-container]', () => {
  let dataBase;
  let localStorage;
  before('Create local storage container', () => {
    dataBase = new Db();
    localStorage = new LocalStorageContainer(dataBase);
  });

  it('Generate identity master seed and recovery key', () => {
    localStorage.unlock('pass');
    const recoveryHex = localStorage.generateIdMasterAndRecoveryKey();
    localStorage.lock('pass');
  });

  it('List all identities stored', () => {
  });
});
