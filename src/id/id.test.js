const chai = require('chai');
const Db = require('../db/db');
const KeyContainer = require('../key-container/key-container');
const Id = require('./id');

const { expect } = chai;

describe('[Identity management]', () => {
  let dataBase;
  let keyContainer;
  before('Create local storage container', () => {
    dataBase = new Db.LocalStorage();
    keyContainer = new KeyContainer(dataBase);
  });

  it('Generate first identity', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    after(() => { keyContainer.lock(); });
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
      const identity = new Id(keys[0], keys[1], keys[2], 'relay test', 0);
      // Save keys and retrieve it
      identity.saveKeys();
      const keysDb = identity.getKeys();
      expect(keys[0]).to.be.equal(keysDb.operationalPub);
      expect(keys[1]).to.be.equal(keysDb.recoverPub);
      expect(keys[2]).to.be.equal(keysDb.revokePub);
      // Create new key for the identity
      const loginKey = identity.createKey(keyContainer, 'login Key');
      // Retrieve keys
      const keysDb2 = identity.getKeys();
      expect(loginKey).to.be.equal(keysDb2['login Key']);
    }
  });

  it('Key generation', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    after(() => { keyContainer.lock(); });
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
      const identity = new Id(keys[0], keys[1], keys[2], 'relay test', 0);
      // Save keys and retrieve it
      identity.saveKeys();
      const keysDb = identity.getKeys();
      expect(keys[0]).to.be.equal(keysDb.operationalPub);
      expect(keys[1]).to.be.equal(keysDb.recoverPub);
      expect(keys[2]).to.be.equal(keysDb.revokePub);
      // Create new key for the identity
      const loginKey = identity.createKey(keyContainer, 'login Key');
      // Retrieve keys
      const keysDb2 = identity.getKeys();
      expect(loginKey).to.be.equal(keysDb2['login Key']);
    }
  });
});
