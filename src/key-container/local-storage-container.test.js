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

  it('Generate Identity master key from random seed', () => {
    localStorage.unlock('pass');
    const IdMnemonic = localStorage.generateMasterAndRecoveryKey();
    localStorage.lock();
    const isValidMnemonic = bip39.validateMnemonic(IdMnemonic);
    expect(isValidMnemonic).to.be.equal(true);
  });

  it('Generate Identity master key from known mnemonic', () => {
    
  });
});
