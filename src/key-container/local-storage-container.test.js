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

  it('Generate Identity master key from random', () => {
    localStorage.unlock('pass');
    const IdMnemonic = localStorage.generateIdMasterKey();
    localStorage.lock();
    const isValidMnemonic = bip39.validateMnemonic(IdMnemonic);
    expect(isValidMnemonic).to.be.equal(true);
  });

  it('Generate Identity master key from known mnemonic', () => {
    const knownMnemonic = 'achieve broccoli tobacco dynamic remind develop aisle parrot jacket wealth atom dust';
    localStorage.unlock('pass');
    const IdMnemonic0 = localStorage.generateIdMasterKey(knownMnemonic);
    const IdMnemonic1 = localStorage.generateIdMasterKey(knownMnemonic);
    localStorage.lock();
    const isValidMnemonic0 = bip39.validateMnemonic(IdMnemonic0);
    const isValidMnemonic1 = bip39.validateMnemonic(IdMnemonic1);
    expect(isValidMnemonic0).to.be.equal(true);
    expect(isValidMnemonic1).to.be.equal(true);
    expect(isValidMnemonic0).to.be.equal(isValidMnemonic1);
  });
});
