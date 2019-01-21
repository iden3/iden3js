const chai = require('chai');
const Db = require('../db/db');
const LocalStorageContainer = require('../key-container/local-storage-container');
const utils = require('./../utils');

const { expect } = chai;

describe('[Identity management]', () => {
  let dataBase;
  let keyContainer;
  before('Create local storage container', () => {
    dataBase = new Db();
    keyContainer = new LocalStorageContainer(dataBase);
  });

  it('Generate first identity', () => {
    keyContainer.unlock('pass');
    const mnemonic = keyContainer.getMasterSeed();
    expect(mnemonic).to.be.equal(undefined);
  });
});
