const chai = require('chai');
const expect = chai.expect;
const iden3 = require('../index');

const kcutils = require('../src/keyContainer/kcutils');

let testPrivKHex = 'da7079f082a1ced80c5dee3bf00752fd67f75321a637e5d5073ce1489af062d8';

describe('kcutils.encrypt', function() {
  it('encrypt', function() {
    let passphrase = 'this is a test passphrase';
    let key = kcutils.passToKey(passphrase, 'a');
    expect(key).to.be.equal('zBugsLjaZkbccvqBulbGlKAqzW4d8ikDO2yY46AP+4E=');

    let m = 'test';
    let c = kcutils.encrypt(key, m);
    let d = kcutils.decrypt(key, c);
    expect(d).to.be.equal(m);
  });
});

describe('kc.type', function() {
  let kcTest = new iden3.KeyContainer('localstorage');
  let kcLocalstorage = new iden3.KeyContainer('localstorage');

  it('type', function() {
    expect(kcTest.type).to.be.equal('localstorage');
    expect(kcLocalstorage.type).to.be.equal('localstorage');
  });
});

describe('new localstorageKeyContainer', function() {
  it('new localstorageKeyContainer', function() {
    let kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    let kc = new iden3.KeyContainer('localstorage');
    expect(kc.type).to.be.equal('localstorage');
  });
});

describe('testkc.importKey()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  let key0 = kc.importKey(testPrivKHex);
  it('imported key', function() {
    expect(iden3.utils.bytesToHex(key0)).to.be.equal('0x0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});

describe('testkc.sign()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  let key0 = kc.importKey(testPrivKHex);

  let signatureObj = kc.sign(key0, 'test');
  it('sign', function() {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('new localstorageKeyContainer', function() {
  it('new localstorageKeyContainer', function() {
    let kc0 = new iden3.KeyContainer('test');
    expect(kc0.type).to.be.equal(undefined);
    let testkc = new iden3.KeyContainer('localstorage');
    expect(testkc.type).to.be.equal('localstorage');
    let lskc = new iden3.KeyContainer('localstorage');
    expect(lskc.type).to.be.equal('localstorage');
  });
});

describe('localstoragekc.importKey()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  // kc.deleteAll();
  let key0 = kc.importKey(testPrivKHex);
  it('imported key', function() {
    expect(key0).to.be.equal('0xbc8c480e68d0895f1e410f4e4ea6e2d6b160ca9f');
  });
});

describe('localstoragekc.sign()', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  // kc.deleteAll();
  let key0 = kc.importKey(testPrivKHex);

  let signatureObj = kc.sign(key0, 'test');
  it('sign', function() {
    expect(signatureObj.signature).to.be.equal('0x5413b44384531e9e92bdd80ff21cea7449441dcfff6f4ed0f90864583e3fcade3d5c8857672b473f71d09355e034dba11bb2ca4aa73c55c534293fdca68941041c');
  });
});

describe('key from mnemonic', function() {
  let kc = new iden3.KeyContainer('localstorage');
  kc.unlock('pass');
  // kc.deleteAll();  delete all to do the test with empty localStorage
  it('key from mnemonic', function() {
    let seed = "blanket kick genre rubber better helmet youth slush acid select brick setup";
    let keys = kc.generateKeysMnemonic(seed);
    // console.log("keys", keys);
    expect(keys.keys[0]).to.be.equal("0x94f1d9fdf01abec15ba9c473dbb87f9931986a86");
    expect(keys.keys[1]).to.be.equal("0xa50970867092c1ae769fc24d5f5151c7b87ff715");
    expect(keys.keys[2]).to.be.equal("0x1526824c893cb894d18f0cc400c24d96340a4341");
  });

  it('new mnemonic', function() {
    let keys = kc.generateKeysMnemonic();
    expect(keys.mnemonic.split(" ").length).to.be.equal(12);
  });

});
