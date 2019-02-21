const chai = require('chai');
const Db = require('./db');
const KeyContainer = require('../key-container/key-container');

const { expect } = chai;

describe('[Database] export and import database', () => {
  const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
  let dataBase;
  let keyContainer;
  before('Create database and fill it', () => {
    dataBase = new Db();
    keyContainer = new KeyContainer('localStorage', dataBase);
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;

      dataBase.insert(key, value);
    }
  });

  before('Generate public key backup', () => {
    keyContainer.unlock('pass');
    const publicBackupKey = keyContainer.generateKeyBackUp(mnemonic);
    expect(publicBackupKey).to.be.not.equal(undefined);
    keyContainer.lock();
  });

  it('Export and import database', () => {
    keyContainer.unlock('pass');
    // Export wallet
    const lsEncrypted = dataBase.exportWallet(keyContainer);
    expect(lsEncrypted).to.be.not.equal(undefined);
    // Import wallet
    // Delete LocalStorage
    dataBase.deleteAll();
    const ack = dataBase.importWallet(mnemonic, keyContainer, lsEncrypted);
    if (!ack) {
      throw new Error('Error importing database');
    }
    for (let i = 0; i < 10; i++) {
      const key = `key-${i}`;
      const value = `value-${i}`;
      const importValue = dataBase.get(key);
      expect(importValue).to.be.equal(value);
    }
  });
});
