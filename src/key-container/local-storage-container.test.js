const chai = require('chai');
const Db = require('../db/db');
const LocalStorageContainer = require('./local-storage-container');

const { expect } = chai;

describe('[Local-storage-container]', () => {
  let dataBase;
  let keyContainer;
  before('Create local storage container', () => {
    dataBase = new Db();
    keyContainer = new LocalStorageContainer(dataBase);
  });

  it('Get master seed without generate it one', () => {
    keyContainer.unlock('pass');
    const mnemonic = keyContainer.getMasterSeed();
    expect(mnemonic).to.be.equal(undefined);
  });

  it('Generate random master seed and retrieve it from local storage', () => {
    keyContainer.unlock('pass');
    const ack = keyContainer.generateMasterSeed();
    if (ack) {
      const mnemonic = keyContainer.getMasterSeed();
      keyContainer.lock();
      expect(mnemonic).to.be.not.equal(undefined);
    }
  });

  it('Save a given master seed and retrieve it from local storage', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    keyContainer.unlock('pass');
    const ack = keyContainer.generateMasterSeed(mnemonic);
    if (ack) {
      const seedDb = keyContainer.getMasterSeed();
      keyContainer.lock();
      expect(mnemonic).to.be.equal(seedDb);
    }
  });

  it('Generate recovery adress and retrieve it from database', () => {
    keyContainer.unlock('pass');
    const seedDb = keyContainer.getMasterSeed();
    const recoveryAddr = keyContainer.generateRecoveryAddr(seedDb);
    const recoveryAddrFromDatabase = keyContainer.getRecoveryAddr();
    expect(recoveryAddr).to.be.equal(recoveryAddrFromDatabase);
    keyContainer.lock();
  });

  it('Generate key seed', () => {
    keyContainer.unlock('pass');
    const masterSeed = keyContainer.getMasterSeed();
    const ack = keyContainer.generateKeySeed(masterSeed);
    if (ack) {
      const { keySeed, pathKey } = keyContainer.getKeySeed();
      keyContainer.lock();
      expect(pathKey).to.be.equal(0);
      expect(keySeed).to.be.equal('drift true reunion shoulder achieve stereo blame absurd evolve elbow include hospital hint evil goddess child shuffle devote game power salt ensure beyond brush');
    }
  });

  it('Generate keys {operational, recovery, revoke} from key path 0', () => {
    keyContainer.unlock('pass');
    const { keySeed, pathKey } = keyContainer.getKeySeed();
    const { keys } = keyContainer.generateKeysFromKeyPath(keySeed, pathKey);
    keyContainer.increaseKeyPath();
    const pathKey1 = (keyContainer.getKeySeed()).pathKey;
    expect(pathKey1).to.be.equal(1);
    expect(keys[0]).to.be.not.equal(undefined);
    expect(keys[1]).to.be.not.equal(undefined);
    expect(keys[2]).to.be.not.equal(undefined);
    expect(keys[3]).to.be.not.equal(undefined);
    keyContainer.lock();
  });

  it('Generate keys {operational, recovery, revoke} from key path 1', () => {
    keyContainer.unlock('pass');
    
    keyContainer.lock();
  });

  it('Generate single key from key path 0', () => {
    keyContainer.unlock('pass');
    const keyProfilePath = 0;
    const keyPath = 0;
    const newAddressHex = keyContainer.generateSingleKey(keyProfilePath, keyPath);
    expect(newAddressHex).to.be.equal('0xc7d89fe96acdb257b434bf580b8e6eb677d445a9');
    keyContainer.lock();
  });
});
