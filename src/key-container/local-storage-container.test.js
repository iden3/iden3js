const chai = require('chai');
const bip39 = require('bip39');
const Db = require('../db/db');
const LocalStorageContainer = require('./local-storage-container');
const utils = require('./../utils');

const { expect } = chai;

describe('[Local-storage-container]', () => {
  let dataBase;
  let localStorage;
  before('Create local storage container', () => {
    dataBase = new Db();
    localStorage = new LocalStorageContainer(dataBase);
  });

  it('Save master seed and retrieve it from local storage', () => {
    const mnemonic = 'enjoy alter satoshi squirrel special spend crop link race rally two eye';
    localStorage.unlock('pass');
    const error = localStorage.saveMasterSeed(mnemonic);
    if (!error) {
      const seedDb = localStorage.getMasterSeed();
      localStorage.lock();
      expect(mnemonic).to.be.equal(seedDb);
    }
  });

  it('Generate id seed', () => {
    localStorage.unlock('pass');
    const masterSeed = localStorage.getMasterSeed();
    const error = localStorage.generateIdSeed(masterSeed);
    if (!error) {
      const { idSeed, pathIdSeed } = localStorage.getIdSeed();
      expect(pathIdSeed).to.be.equal(utils.bytesToHex(Buffer.alloc(8)));
      expect(idSeed).to.be.equal('drift true reunion shoulder achieve stereo blame absurd evolve elbow include hospital hint evil goddess child shuffle devote game power salt ensure beyond brush');
    }
  });
});
