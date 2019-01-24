const chai = require('chai');
const Db = require('../db/db');
const LocalStorageContainer = require('../key-container/local-storage-container');
const Id = require('./id');

const { expect } = chai;

describe('[ Identity ]', () => {
  let dataBase;
  let keyContainer;
  before('Create local storage container', () => {
    dataBase = new Db();
    keyContainer = new LocalStorageContainer(dataBase);
  });

  it('Generate first identity flow', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    // Generate key master in key container
    keyContainer.generateMasterSeed(mnemonic);
    const mnemonicDb = keyContainer.getMasterSeed();
    // Check master seed from database is the same as the master seed input
    expect(mnemonic).to.be.equal(mnemonicDb);
    // Generate Key seed
    const ack = keyContainer.generateKeySeed(mnemonicDb);
    if (ack) {
      const { keySeed, pathKey } = keyContainer.getKeySeed();
      // Generate keys for first identity
      const { keys } = keyContainer.generateKeysFromKeyPath(keySeed, pathKey);
      const identity = new Id(keys[1], keys[2], keys[3], 'relay test', 'relay address', '', undefined, 0);
      // Save keys and retrieve it
      identity.saveKeys();
      const keysDb = identity.getKeys();
      expect(keys[1]).to.be.equal(keysDb.operationalPub);
      expect(keys[2]).to.be.equal(keysDb.recover);
      expect(keys[3]).to.be.equal(keysDb.revoke);
      // Create new key for the identity
      const loginKey = identity.createKey(keyContainer, 'login Key');
      // Retrieve keys
      const keysDb2 = identity.getKeys();
      expect(loginKey).to.be.equal(keysDb2['login Key']);
    }
  });
});
