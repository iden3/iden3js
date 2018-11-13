const chai = require('chai');
const iden3 = require('../index');
const kcUtils = require('../src/key-container/kc-utils');

const {expect} = chai;
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
  const kcTest = new iden3.KeyContainer('localStorage');
  const kcLocalstorage = new iden3.KeyContainer('localStorage');

  it('type', () => {
    expect(kcTest.type).to.be.equal('localStorage');
    expect(kcLocalstorage.type).to.be.equal('localStorage');
  });
});

describe('new localstorageKeyContainer', () => {
  it('new localstorageKeyContainer', () => {
    const kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    const kc = new iden3.KeyContainer('localStorage');
    expect(kc.type).to.be.equal('localStorage');
  });
});

describe('testkc.importKey()', () => {
  const kc = new iden3.KeyContainer('localStorage');
  kc.unlock('pass');
  const key0 = kc.importKey(testPrivKHex);

  it('imported key', () => {
    expect(iden3.utils.bytesToHex(key0)).to.be.equal('0x0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});

describe('testkc.sign()', () => {
  const kc = new iden3.KeyContainer('localStorage');
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
    const testkc = new iden3.KeyContainer('localStorage');
    expect(testkc.type).to.be.equal('localStorage');
    const lskc = new iden3.KeyContainer('localStorage');
    expect(lskc.type).to.be.equal('localStorage');
  });
});

describe('localstoragekc.importKey()', () => {
  const kc = new iden3.KeyContainer('localStorage');
  kc.unlock('pass');
  const key0 = kc.importKey(testPrivKHex);

  it('imported key', () => {
    expect(key0).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});

describe('localstoragekc.sign()', () => {
  const kc = new iden3.KeyContainer('localStorage');
  kc.unlock('pass');
  const key0 = kc.importKey(testPrivKHex);
  const signatureObj = kc.sign(key0, 'test');

  it('sign', () => {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('key from mnemonic', () => {
  const kc = new iden3.KeyContainer('localStorage');
  kc.unlock('pass');
  // kc.deleteAll();  delete all to do the test with empty localStorage
  it('key from mnemonic', () => {
    const seed = 'blanket kick genre rubber better helmet youth slush acid select brick setup';
    const keys = kc.generateKeysMnemonic(seed);
    // console.log('keys', keys);
    expect(keys.keys[0]).to.be.equal('0x94f1d9fdf01abec15ba9c473dbb87f9931986a86');
    expect(keys.keys[1]).to.be.equal('0xa50970867092c1ae769fc24d5f5151c7b87ff715');
    expect(keys.keys[2]).to.be.equal('0x1526824c893cb894d18f0cc400c24d96340a4341');
  });

  it('new mnemonic', () => {
    const keys = kc.generateKeysMnemonic();
    expect(keys.mnemonic.split(' ').length).to.be.equal(12);
  });
});


describe('mnemonic paths', () => {
  const kc = new iden3.KeyContainer('localStorage');
  kc.unlock('pass');
  // kc.deleteAll();  delete all to do the test with empty localStorage
  it('different derivation paths for different identity profiles', () => {
    const seed = 'blanket kick genre rubber better helmet youth slush acid select brick setup';
    const keys_id0 = kc.generateKeysMnemonic(seed, 0, 3);
    expect(keys_id0.keys[0]).to.be.equal('0x94f1d9fdf01abec15ba9c473dbb87f9931986a86');
    expect(keys_id0.keys[1]).to.be.equal('0xa50970867092c1ae769fc24d5f5151c7b87ff715');
    expect(keys_id0.keys[2]).to.be.equal('0x1526824c893cb894d18f0cc400c24d96340a4341');

    const keys_id1 = kc.generateKeysMnemonic(seed, 1, 3);
    expect(keys_id1.keys[0]).to.be.equal('0x3c2b02892a7dd7dfe8a056da357c315ce6f3720e');
    expect(keys_id1.keys[1]).to.be.equal('0x6da7dc9b0081e6f8817a7225019b97fc59ce3528');
    expect(keys_id1.keys[2]).to.be.equal('0xb8498e742ec40c8ca9c06e530731808e9ab54475');


    const keys_id2 = kc.generateKeysMnemonic(seed, 2, 4);
    expect(keys_id2.keys[0]).to.be.equal('0x41873fb0da6686f811f2563c6a5229550c3180ec');
    expect(keys_id2.keys[1]).to.be.equal('0x29ffa50c2c7865308701eba8687433967f845bde');
    expect(keys_id2.keys[2]).to.be.equal('0x153dd9339303e768e7522fdc5fc6375790edacae');
    expect(keys_id2.keys[3]).to.be.equal('0x340a3d40a444487a53c686097656e5cd938540ff');

    const keys_id3 = kc.generateKeysMnemonic(seed, 3, 3);
    expect(keys_id3.keys[0]).to.be.equal('0x533ccefc330e5cfca66bfb7c9d3fc6b5e7d227de');
    expect(keys_id3.keys[1]).to.be.equal('0xfcbff1ba506445b8ee1cf17fcacac5c1a43ba184');
    expect(keys_id3.keys[2]).to.be.equal('0x0c75c1527c5483243ba416a69af585ec1d89e77f');
  });

});
