const chai = require('chai');
const Db = require('./db');
const KeyContainer = require('../key-container/key-container');

const { expect } = chai;

describe('[Database] export and import database', () => {
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

  it('Export and import database', () => {
    keyContainer.unlock('pass');
    // Export wallet
    const lsEncrypted = dataBase.exportWallet(keyContainer, dataBase);
    expect(lsEncrypted).to.be.not.equal(undefined);
    // Import wallet
    // Delete LocalStorage
    dataBase.deleteAll();
    const ack = dataBase.importWallet(keyContainer, lsEncrypted);
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
