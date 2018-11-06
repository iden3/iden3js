const chai = require('chai');
const CONSTANTS = require('../src/constants');
const iden3 = require('../index');
const kcUtils = require('../src/key-container/kc-utils');

const { expect } = chai;
const testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('kcUtils.encrypt', () => {
  it('encrypt', () => {
    const passphrase = 'this is a test passphrase';
    const key = kcUtils.passToKey(passphrase, 'a');
    expect(key).to.be.equal('zBugsLjaZkbccvqBulbGlKAqzW4d8ikDO2yY46AP+4E=');

    const m = 'test';
    const c = kcUtils.encrypt(key, m);
    const d = kcUtils.decrypt(key, c);
    expect(d).to.be.equal(m);
  });
});

describe('kc.type', () => {
  const kcTest = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  const kcLocalstorage = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);

  it('type', () => {
    expect(kcTest.type).to.be.equal(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
    expect(kcLocalstorage.type).to.be.equal(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  });
});

describe('new localstorageKeyContainer', () => {
  it('new localstorageKeyContainer', () => {
    const kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
    expect(kc.type).to.be.equal(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  });
});

describe('testkc.importKey()', () => {
  const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  kc.unlock('pass');
  const key0 = kc.importKey(testPrivKHex);

  it('imported key', () => {
    expect(iden3.utils.bytesToHex(key0)).to.be.equal('0x0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});

describe('testkc.sign()', () => {
  const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  kc.unlock('pass');
  const key0 = kc.importKey(testPrivKHex);
  const signatureObj = kc.sign(key0, 'test');

  it('sign', () => {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('new localstorageKeyContainer', () => {
  it('new localstorageKeyContainer', () => {
    const kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    const testkc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
    expect(testkc.type).to.be.equal(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
    const lskc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
    expect(lskc.type).to.be.equal(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  });
});

describe('localstoragekc.importKey()', () => {
  const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  kc.unlock('pass');
  const key0 = kc.importKey(testPrivKHex);

  it('imported key', () => {
    expect(key0).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});

describe('localstoragekc.sign()', () => {
  const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  kc.unlock('pass');
  const key0 = kc.importKey(testPrivKHex);
  const signatureObj = kc.sign(key0, 'test');

  it('sign', () => {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('key from mnemonic', () => {
  const kc = new iden3.KeyContainer(CONSTANTS.STORAGE.LOCAL_STORAGE.ID);
  kc.unlock('pass');
  // kc.deleteAll();  delete all to do the test with empty localStorage
  it('key from mnemonic', () => {
    const seed = 'blanket kick genre rubber better helmet youth slush acid select brick setup';
    const keys = kc.generateKeysMnemonic(seed);
    // console.log("keys", keys);
    expect(keys.keys[0]).to.be.equal('0x94f1d9fdf01abec15ba9c473dbb87f9931986a86');
    expect(keys.keys[1]).to.be.equal('0xa50970867092c1ae769fc24d5f5151c7b87ff715');
    expect(keys.keys[2]).to.be.equal('0x1526824c893cb894d18f0cc400c24d96340a4341');
  });

  it('new mnemonic', () => {
    const keys = kc.generateKeysMnemonic();
    expect(keys.mnemonic.split(' ').length).to.be.equal(12);
  });
});
