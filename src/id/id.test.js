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
    keyContainer.setMasterSeed(mnemonic);
    // Generate keys for first identity
    const keys = keyContainer.createKeys();
    const identity = new Id(keys.kOp, keys.kDis, keys.kReen, 'relay test', 0);
    // Save keys and retrieve it
    identity.saveKeys();
    const keysDb = identity.getKeys();
    expect(keys.kOp.toString()).to.be.equal(keysDb.operationalPub);
    expect(keys.kDis).to.be.equal(keysDb.disablePub);
    expect(keys.kReen).to.be.equal(keysDb.reenablePub);
    // Create new key for the identity
    const loginKey = identity.createKey(keyContainer, 'login Key');
    // Retrieve keys
    const keysDb2 = identity.getKeys();
    expect(loginKey).to.be.equal(keysDb2['login Key']);
  });
});
